"""
kautm.net 비즈니스 뉴스 크롤러
크롤링 대상 URL 및 셀렉터는 Supabase tb_crawl_target 테이블에서 관리합니다.
"""

import os
import time
from datetime import datetime, timezone

from playwright.sync_api import sync_playwright
from supabase import create_client, Client


DELAY_SEC = 1.5
MAX_PAGES = 10


def get_supabase_client() -> Client:
    return create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])


def parse_date(date_str: str) -> str | None:
    """날짜 문자열을 YYYY-MM-DD 형식으로 변환합니다."""
    if not date_str:
        return None
    for fmt in ["%Y-%m-%d", "%Y.%m.%d", "%Y/%m/%d", "%y-%m-%d", "%y.%m.%d", "%y/%m/%d"]:
        try:
            return datetime.strptime(date_str.strip(), fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return None


def get_active_targets(client: Client) -> list[dict]:
    """tb_crawl_target에서 활성화된 크롤링 대상 목록을 가져옵니다."""
    result = (
        client.table("tb_crawl_target")
        .select("*")
        .eq("is_active", True)
        .execute()
    )
    return result.data or []


def get_last_post_date(client: Client, target_id: int) -> str | None:
    """특정 타겟의 직전 실행에서 저장한 마지막 게시물 작성일을 가져옵니다."""
    result = (
        client.table("tb_crawl_run_history")
        .select("last_post_date")
        .eq("target_id", target_id)
        .order("executed_at", desc=True)
        .limit(1)
        .execute()
    )
    if result.data:
        return result.data[0]["last_post_date"]
    return None


def save_run_history(client: Client, target_id: int, last_post_date: str | None):
    """실행 내역을 저장합니다."""
    client.table("tb_crawl_run_history").insert({
        "target_id":     target_id,
        "executed_at":   datetime.now(timezone.utc).isoformat(),
        "last_post_date": last_post_date,
    }).execute()


def scrape_page(page, url: str, target: dict, last_post_date: str | None) -> tuple[list[dict], bool]:
    """
    한 페이지의 게시글을 스크래핑합니다.

    Returns:
        (posts, should_continue)
        should_continue: False이면 last_post_date 이하 게시물 도달 → 다음 페이지 불필요
    """
    page.goto(url, wait_until="networkidle", timeout=30000)
    time.sleep(1)

    rows = []

    items = page.query_selector_all(target["row_selector"])
    if not items:
        print(f"  [경고] 게시글을 찾지 못했습니다. row_selector: {target['row_selector']}")
        return rows, False

    for item in items:
        title_el = item.query_selector(target["title_selector"])
        if not title_el:
            continue

        title = title_el.inner_text().strip()
        href  = title_el.get_attribute("href") or ""
        link  = href if href.startswith("http") else f"{_base_origin(target['target_url'])}{href}"

        date_el   = item.query_selector(target["date_selector"])
        post_date = date_el.inner_text().strip() if date_el else ""

        author_selector = target.get("author_selector") or ""
        author_el = item.query_selector(author_selector) if author_selector else None
        author    = author_el.inner_text().strip() if author_el else ""

        post_date_iso = parse_date(post_date)

        # 마지막 수집일 이하 게시물에 도달하면 수집 중단
        if last_post_date and post_date_iso and post_date_iso <= last_post_date:
            print(f"  → 마지막 수집일({last_post_date}) 이하 게시물 도달, 수집 중단")
            return rows, False

        rows.append({
            "target_id": target["id"],
            "title":     title,
            "link":      link,
            "post_date": post_date_iso or post_date,
            "author":    author,
        })

    return rows, True


def _base_origin(url: str) -> str:
    """URL에서 origin(scheme + host)만 추출합니다. 예: http://www.example.com"""
    from urllib.parse import urlparse
    p = urlparse(url)
    return f"{p.scheme}://{p.netloc}"


def build_page_url(target: dict, page_num: int) -> str:
    """페이지 번호에 해당하는 URL을 반환합니다."""
    param = target.get("page_param") or "page"
    return f"{target['target_url']}&{param}={page_num}"


def has_next_page(page, target: dict, current_page: int) -> bool:
    param = target.get("page_param") or "page"
    next_selector = f"a[href*='{param}={current_page + 1}'], .paging a.next, .pagination a.next"
    return page.query_selector(next_selector) is not None


def upsert_to_supabase(client: Client, posts: list[dict]) -> int:
    if not posts:
        return 0

    now = datetime.now(timezone.utc).isoformat()
    for post in posts:
        post["crawled_at"] = now

    result = (
        client.table("tb_news_crawl")
        .upsert(posts, on_conflict="link")
        .execute()
    )
    return len(result.data) if result.data else 0


def crawl_target(browser, client: Client, target: dict):
    """단일 타겟에 대한 크롤링을 수행합니다."""
    print(f"\n[타겟] {target['name']} ({target['target_url']})")

    last_post_date = get_last_post_date(client, target["id"])
    if last_post_date:
        print(f"  마지막 수집일: {last_post_date} → 이후 게시물만 수집")
    else:
        print("  최초 실행 → 전체 수집")

    all_posts: list[dict] = []
    context = browser.new_context(
        user_agent=(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        )
    )
    page = context.new_page()

    for page_num in range(1, MAX_PAGES + 1):
        url = target["target_url"] if page_num == 1 else build_page_url(target, page_num)
        print(f"  페이지 {page_num} 수집 중: {url}")

        posts, should_continue = scrape_page(page, url, target, last_post_date)
        print(f"    → {len(posts)}건 수집")
        all_posts.extend(posts)

        if not should_continue:
            break

        if not has_next_page(page, target, page_num):
            print("  마지막 페이지 도달, 종료")
            break

        time.sleep(DELAY_SEC)

    context.close()

    saved = upsert_to_supabase(client, all_posts)
    print(f"  저장 완료: {saved}건")

    newest_date = None
    if all_posts:
        dates = [p["post_date"] for p in all_posts if p.get("post_date")]
        if dates:
            newest_date = max(dates)

    save_run_history(client, target["id"], newest_date or last_post_date)
    print(f"  실행내역 저장 (last_post_date: {newest_date or last_post_date})")


def main():
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 크롤링 시작")

    client = get_supabase_client()
    targets = get_active_targets(client)

    if not targets:
        print("활성화된 크롤링 타겟이 없습니다. tb_crawl_target을 확인하세요.")
        return

    print(f"활성 타겟 {len(targets)}개 발견")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for target in targets:
            crawl_target(browser, client, target)
        browser.close()

    print(f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 전체 크롤링 종료")


if __name__ == "__main__":
    main()
