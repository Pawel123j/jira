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
        page.get_by_role('button',name='Tablica',exact=True).click()
        page.set_viewport_size({'width':390,'height':844})
        page.evaluate('window.scrollTo(0, 0)')
        page.wait_for_timeout(350)
        for toast in page.get_by_role('button',name='Zamknij powiadomienie').all():
            toast.click()
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        page.screenshot(path=str(REPO / 'docs' / 'screenshots' / 'mobile-kanban.png'))
        page.set_viewport_size({'width':1440,'height':1000})
        page.get_by_role('button',name='Lista',exact=True).click()
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


def test_malformed_legacy_storage_can_be_recovered(tmp_path):
    with static_site(REPO / 'dist') as url, browser() as b:
        page=b.new_page(viewport={'width':390,'height':844})
        page.add_init_script("localStorage.setItem('mini-jira:tasks', '{}')")
        page.goto(url)
        page.get_by_role('button',name='Zaloguj się',exact=True).click()
        recovery_notice=page.get_by_role('status').filter(has_text='Nie można odczytać zapisu')
        expect(recovery_notice).to_be_visible()
        assert page.evaluate("localStorage.getItem('mini-jira:tasks')") == '{}'
        with page.expect_download() as recovery:
            page.get_by_role('button',name='Pobierz oryginalny zapis',exact=True).click()
        recovery_file=tmp_path/'jira-recovery.json'
        recovery.value.save_as(recovery_file)
        assert '"tasks": "{}"' in recovery_file.read_text()
        page.on('dialog',lambda dialog:dialog.accept())
        page.get_by_role('button',name='Ponów zapis',exact=True).click()
        expect(recovery_notice).to_have_count(0)
        saved=page.evaluate("JSON.parse(localStorage.getItem('mini-jira:snapshot'))")
        assert len(saved['tasks']) == 3
