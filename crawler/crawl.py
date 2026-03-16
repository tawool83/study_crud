"""
kautm.net 비즈니스 뉴스 크롤러
대상: http://www.kautm.net/bbs/?so_table=tlo_news&category=business
저장: Supabase tb_news_crawl 테이블
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

MAX_PAGES = 1          # 크롤링할 최대 페이지 수 (필요에 따라 조정)
DELAY_SEC = 1.5        # 페이지 간 대기 시간 (서버 부하 방지)
# ─────────────────────────────────────────────────────────────────────────────


def get_supabase_client() -> Client:
    url = os.environ["SUPABASE_URL"]
    key = os.environ["SUPABASE_SERVICE_KEY"]   # service_role key (쓰기 권한)
    return create_client(url, key)


def scrape_page(page, url: str) -> list[dict]:
    """
    한 페이지의 게시글 목록을 스크래핑합니다.

    ※ 실제 페이지를 브라우저로 열어 개발자 도구(F12)로 HTML 구조를 확인한 후,
      아래 CSS 셀렉터를 수정하세요.

    일반적인 한국 BBS 구조 예시:
      - 목록 행:  table.bbs_list tbody tr  또는  ul.board_list li
      - 제목:     td.subject a  또는  .title a
      - 날짜:     td.date  또는  .date
      - 작성자:   td.writer  또는  .writer
    """
    page.goto(url, wait_until="networkidle", timeout=30000)
    time.sleep(1)  # JS 렌더링 완료 대기

    rows = []

    # ── 셀렉터 ────────────────────────────────────────────────────────────────
    # ROW_SELECTOR: 모든 행을 선택 (tbody의 모든 tr)
    ROW_SELECTOR    = "div.listTable > table > tbody > tr"
    # 아래 셀렉터는 각 tr 행 기준 상대 경로
    TITLE_SELECTOR  = "td.title > a"
    DATE_SELECTOR   = "td:nth-child(4)"
    AUTHOR_SELECTOR = "td:nth-child(3)"
    # ─────────────────────────────────────────────────────────────────────────

    items = page.query_selector_all(ROW_SELECTOR)
    if not items:
        print(f"  [경고] 게시글을 찾지 못했습니다. 셀렉터를 확인하세요: {ROW_SELECTOR}")
        return rows

    for item in items:
        # 제목 & 링크
        title_el = item.query_selector(TITLE_SELECTOR)
        if not title_el:
            continue  # 공지·광고 행 등 제목 없는 행 스킵

        title = title_el.inner_text().strip()
        href  = title_el.get_attribute("href") or ""
        link  = href if href.startswith("http") else f"http://www.kautm.net{href}"

        # 날짜
        date_el = item.query_selector(DATE_SELECTOR)
        post_date = date_el.inner_text().strip() if date_el else ""

        # 작성자
        author_el = item.query_selector(AUTHOR_SELECTOR)
        author = author_el.inner_text().strip() if author_el else ""

        rows.append({
            "title":     title,
            "link":      link,
            "post_date": post_date,
            "author":    author,
            "category":  CATEGORY,
        })

    return rows


def has_next_page(page, current_page: int) -> bool:
    """다음 페이지가 존재하는지 확인합니다."""
    # 페이지네이션 셀렉터 — 실제 구조에 맞게 수정하세요
    next_selector = f"a[href*='page={current_page + 1}'], .paging a.next, .pagination a.next"
    return page.query_selector(next_selector) is not None


def build_page_url(page_num: int) -> str:
    """페이지 번호에 해당하는 URL을 반환합니다."""
    # ※ 실제 페이지네이션 URL 패턴에 맞게 수정하세요
    # 예: ?page=2  또는  &pg=2  또는  /2/
    return f"{TARGET_URL}&page={page_num}"


def upsert_to_supabase(client: Client, posts: list[dict]) -> int:
    """
    Supabase에 크롤링 데이터를 upsert합니다.
    link를 unique key로 사용해 중복 삽입을 방지합니다.
    """
    if not posts:
        return 0

    now = datetime.now(timezone.utc).isoformat()
    for post in posts:
        post["crawled_at"] = now

    result = (
        client.table("tb_news_crawl")
        .upsert(posts, on_conflict="link")   # link 컬럼에 unique 제약 필요
        .execute()
    )
    return len(result.data) if result.data else 0


def main():
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 크롤링 시작")
    print(f"  대상 URL: {TARGET_URL}")

    supabase = get_supabase_client()
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

            posts = scrape_page(page, url)
            print(f"    → {len(posts)}건 수집")
            all_posts.extend(posts)

            if not has_next_page(page, page_num):
                print("  마지막 페이지 도달, 종료")
                break

            time.sleep(DELAY_SEC)

        browser.close()

    print(f"\n총 {len(all_posts)}건 수집 완료. Supabase 저장 중...")
    saved = upsert_to_supabase(supabase, all_posts)
    print(f"저장 완료: {saved}건 (upsert)")
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 크롤링 종료")


if __name__ == "__main__":
    main()
