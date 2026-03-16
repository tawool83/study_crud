"""
kautm.net 비즈니스 뉴스 크롤러
대상: http://www.kautm.net/bbs/?so_table=tlo_news&category=business
저장: Supabase tb_news_crawl 테이블
실행내역: tb_crawl_run_history 테이블 (마지막 수집일 기준 신규 게시물만 수집)
"""

import os
import time
from datetime import datetime, timezone

from playwright.sync_api import sync_playwright
from supabase import create_client, Client


# ── 설정 ──────────────────────────────────────────────────────────────────────
BASE_URL = "http://www.kautm.net/bbs/"
CATEGORY = "business"
TABLE_NAME = "so_table=tlo_news"
TARGET_URL = f"{BASE_URL}?{TABLE_NAME}&category={CATEGORY}"

MAX_PAGES = 10         # 크롤링할 최대 페이지 수
DELAY_SEC = 1.5        # 페이지 간 대기 시간 (서버 부하 방지)
# ─────────────────────────────────────────────────────────────────────────────


def get_supabase_client() -> Client:
    url = os.environ["SUPABASE_URL"]
    key = os.environ["SUPABASE_SERVICE_KEY"]
    return create_client(url, key)


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


def get_last_post_date(client: Client) -> str | None:
    """직전 실행에서 저장한 마지막 게시물 작성일을 가져옵니다."""
    result = (
        client.table("tb_crawl_run_history")
        .select("last_post_date")
        .order("executed_at", desc=True)
        .limit(1)
        .execute()
    )
    if result.data:
        return result.data[0]["last_post_date"]
    return None


def save_run_history(client: Client, last_post_date: str | None):
    """실행 내역을 저장합니다."""
    client.table("tb_crawl_run_history").insert({
        "executed_at": datetime.now(timezone.utc).isoformat(),
        "last_post_date": last_post_date,
    }).execute()


def scrape_page(page, url: str, last_post_date: str | None) -> tuple[list[dict], bool]:
    """
    한 페이지의 게시글을 스크래핑합니다.

    Returns:
        (posts, should_continue)
        should_continue: False이면 last_post_date 이하 게시물에 도달 → 다음 페이지 불필요
    """
    page.goto(url, wait_until="networkidle", timeout=30000)
    time.sleep(1)

    rows = []

    # ── 셀렉터 ────────────────────────────────────────────────────────────────
    ROW_SELECTOR    = "div.listTable > table > tbody > tr"
    TITLE_SELECTOR  = "td.title > a"
    DATE_SELECTOR   = "td:nth-child(4)"
    AUTHOR_SELECTOR = "td:nth-child(3)"
    # ─────────────────────────────────────────────────────────────────────────

    items = page.query_selector_all(ROW_SELECTOR)
    if not items:
        print(f"  [경고] 게시글을 찾지 못했습니다. 셀렉터를 확인하세요: {ROW_SELECTOR}")
        return rows, False

    for item in items:
        title_el = item.query_selector(TITLE_SELECTOR)
        if not title_el:
            continue

        title = title_el.inner_text().strip()
        href  = title_el.get_attribute("href") or ""
        link  = href if href.startswith("http") else f"http://www.kautm.net{href}"

        date_el   = item.query_selector(DATE_SELECTOR)
        post_date = date_el.inner_text().strip() if date_el else ""

        author_el = item.query_selector(AUTHOR_SELECTOR)
        author    = author_el.inner_text().strip() if author_el else ""

        post_date_iso = parse_date(post_date)

        # 마지막 수집일 이하 게시물에 도달하면 수집 중단
        if last_post_date and post_date_iso and post_date_iso <= last_post_date:
            print(f"  → 마지막 수집일({last_post_date}) 이하 게시물 도달, 수집 중단")
            return rows, False

        rows.append({
            "title":     title,
            "link":      link,
            "post_date": post_date_iso or post_date,
            "author":    author,
            "category":  CATEGORY,
        })

    return rows, True


def has_next_page(page, current_page: int) -> bool:
    next_selector = f"a[href*='page={current_page + 1}'], .paging a.next, .pagination a.next"
    return page.query_selector(next_selector) is not None


def build_page_url(page_num: int) -> str:
    return f"{TARGET_URL}&page={page_num}"


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


def main():
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 크롤링 시작")

    supabase = get_supabase_client()

    # 직전 실행의 마지막 게시물 작성일 조회
    last_post_date = get_last_post_date(supabase)
    if last_post_date:
        print(f"  마지막 수집일: {last_post_date} → 이후 게시물만 수집")
    else:
        print("  최초 실행 → 전체 수집")

    all_posts: list[dict] = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            )
        )
        page = context.new_page()

        for page_num in range(1, MAX_PAGES + 1):
            url = TARGET_URL if page_num == 1 else build_page_url(page_num)
            print(f"  페이지 {page_num} 수집 중: {url}")

            posts, should_continue = scrape_page(page, url, last_post_date)
            print(f"    → {len(posts)}건 수집")
            all_posts.extend(posts)

            if not should_continue:
                break

            if not has_next_page(page, page_num):
                print("  마지막 페이지 도달, 종료")
                break

            time.sleep(DELAY_SEC)

        browser.close()

    print(f"\n총 {len(all_posts)}건 신규 수집. Supabase 저장 중...")
    saved = upsert_to_supabase(supabase, all_posts)
    print(f"저장 완료: {saved}건")

    # 수집된 게시물 중 가장 최신 작성일을 실행내역에 저장
    newest_date = None
    if all_posts:
        dates = [p["post_date"] for p in all_posts if p.get("post_date")]
        if dates:
            newest_date = max(dates)

    # 신규 게시물이 없어도 실행 자체는 기록 (last_post_date는 유지)
    save_run_history(supabase, newest_date or last_post_date)
    print(f"실행내역 저장 완료 (last_post_date: {newest_date or last_post_date})")
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 크롤링 종료")


if __name__ == "__main__":
    main()
