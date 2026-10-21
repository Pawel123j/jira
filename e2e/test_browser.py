import re
from pathlib import Path
from playwright.sync_api import expect
from browser_support import browser, static_site
from accessibility import assert_accessible

REPO = Path(__file__).resolve().parents[1]

def test_jira_crud_persistence():
    with static_site(REPO / 'dist') as url, browser() as b:
        page=b.new_page(viewport={'width':1440,'height':1000})
        errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto(url)
        assert_accessible(page, REPO, 'login')
        page.get_by_role('button',name='Zaloguj się',exact=True).focus()
        page.keyboard.press('Enter')
        assert_accessible(page, REPO, 'board')
        page.locator('#create-title').fill('E2E task')
        page.get_by_role('button',name='Dodaj task',exact=True).click()
        page.get_by_placeholder('Szukaj po tytule, opisie, tagu lub osobie').fill('E2E task')
        page.get_by_role('button',name=re.compile('^E2E task MEDIUM')).click()
        assert_accessible(page, REPO, 'edit-task')
        page.locator('#edit-title').fill('E2E task edited')
        page.get_by_role('button',name='Zapisz task',exact=True).click()
        page.reload()
        expect(page.get_by_role('button',name=re.compile('^E2E task edited MEDIUM'))).to_be_visible()
        page.get_by_role('button',name=re.compile('^E2E task edited MEDIUM')).click()
        page.get_by_role('button',name='Usuń trwale',exact=True).click()
        page.get_by_role('dialog').get_by_role('button',name='Usuń trwale',exact=True).click()
        expect(page.get_by_role('button',name=re.compile('^E2E task edited MEDIUM'))).to_have_count(0)
        assert not errors,errors
