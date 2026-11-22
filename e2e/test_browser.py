import json
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
        recovery_notice=page.get_by_role('alert')
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


def import_payload():
    return {
        'version': 1,
        'exportedAt': '2026-11-13T10:00:00Z',
        'tasks': [{
            'id': 'imported-task',
            'title': 'Imported browser task',
            'description': 'A complete imported board',
            'priority': 'MEDIUM',
            'status': 'To do',
            'assignees': [],
            'due': '',
            'tags': [],
            'points': 3,
            'subtasks': [{'id': 'imported-subtask', 'title': 'Verify import', 'done': False}],
            'deleted': False,
            'createdAt': '2026-11-13T09:00:00Z',
            'updatedAt': '2026-11-13T10:00:00Z',
        }],
        'comments': {'imported-task': [
            {'id': 'imported-comment', 'author': 'Browser test', 'text': 'Keep this comment', 'time': '10:00'},
        ]},
        'audit': [{
            'id': 'imported-audit',
            'action': 'TASK_CREATED',
            'actor': 'Browser test',
            'detail': 'Original history',
            'time': '09:00',
        }],
    }


def upload_import(page, payload):
    page.locator('input[type="file"]').set_input_files({
        'name': 'board.json',
        'mimeType': 'application/json',
        'buffer': json.dumps(payload).encode(),
    })


def saved_snapshot(page):
    return page.evaluate("localStorage.getItem('mini-jira:snapshot')")


def test_import_preview_cancel_confirm_and_reload():
    with static_site(REPO / 'dist') as url, browser() as b:
        page = b.new_page(viewport={'width': 1440, 'height': 1000})
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(url)
        page.get_by_role('button', name='Zaloguj się', exact=True).click()
        original = saved_snapshot(page)
        payload = import_payload()
        upload_import(page, payload)
        preview = page.get_by_role('dialog', name='Podgląd importu')
        expect(preview).to_be_visible()
        expect(preview).to_contain_text('Zadania: 1. Komentarze: 1. Podzadania: 1. Wpisy historii: 1.')
        page.keyboard.press('/')
        expect(preview.get_by_role('button', name='Anuluj', exact=True)).to_be_focused()
        assert saved_snapshot(page) == original
        imported_task = page.get_by_role('button', name=re.compile('^Imported browser task MEDIUM'))
        expect(imported_task).to_have_count(0)
        assert_accessible(page, REPO, 'import-preview')
        preview.get_by_role('button', name='Anuluj', exact=True).click()
        expect(preview).to_have_count(0)
        assert saved_snapshot(page) == original
        expect(imported_task).to_have_count(0)

        upload_import(page, payload)
        expect(preview).to_be_visible()
        preview.get_by_role('button', name='Zastąp dane', exact=True).click()
        expect(preview).to_have_count(0)
        expect(imported_task).to_be_visible()
        saved = json.loads(saved_snapshot(page))
        assert saved['tasks'] == payload['tasks']
        assert saved['comments'] == payload['comments']
        assert saved['audit'][0]['action'] == 'DATA_IMPORTED'
        assert payload['audit'][0] in saved['audit']
        page.reload()
        expect(imported_task).to_be_visible()
        assert json.loads(saved_snapshot(page))['tasks'] == payload['tasks']
        assert not errors, errors


def test_invalid_nested_import_keeps_existing_board():
    with static_site(REPO / 'dist') as url, browser() as b:
        page = b.new_page(viewport={'width': 1440, 'height': 1000})
        page.goto(url)
        page.get_by_role('button', name='Zaloguj się', exact=True).click()
        original = saved_snapshot(page)
        payload = import_payload()
        payload['tasks'][0]['subtasks'][0]['done'] = 'false'
        upload_import(page, payload)
        expect(page.get_by_text('Nieprawidłowy plik — import przerwany.', exact=True)).to_be_visible()
        expect(page.get_by_role('dialog', name='Podgląd importu')).to_have_count(0)
        assert saved_snapshot(page) == original
        expect(page.get_by_role('button', name=re.compile('^Imported browser task MEDIUM'))).to_have_count(0)


def test_import_save_failure_keeps_saved_and_in_memory_data(tmp_path):
    with static_site(REPO / 'dist') as url, browser() as b:
        page = b.new_page(viewport={'width': 1440, 'height': 1000})
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(url)
        page.get_by_role('button', name='Zaloguj się', exact=True).click()
        original = saved_snapshot(page)
        page.evaluate("""() => {
            const originalSetItem = Storage.prototype.setItem;
            Storage.prototype.setItem = function(key, value) {
                if (key === 'mini-jira:snapshot') {
                    throw new DOMException('Storage full', 'QuotaExceededError');
                }
                return originalSetItem.call(this, key, value);
            };
        }""")
        upload_import(page, import_payload())
        preview = page.get_by_role('dialog', name='Podgląd importu')
        expect(preview).to_be_visible()
        preview.get_by_role('button', name='Zastąp dane', exact=True).click()
        expect(page.get_by_role('alert')).to_be_visible()
        assert saved_snapshot(page) == original
        expect(page.get_by_role('button', name=re.compile('^Imported browser task MEDIUM'))).to_have_count(0)
        expect(page.get_by_text('Zaimportowano 1 zadań.', exact=True)).to_have_count(0)
        if preview.count():
            preview.get_by_role('button', name='Anuluj', exact=True).click()
        with page.expect_download() as export:
            page.get_by_role('button', name='Eksport', exact=True).click()
        export_file = tmp_path / 'unchanged-board.json'
        export.value.save_as(export_file)
        exported = json.loads(export_file.read_text())
        previous = json.loads(original)
        for field in ('tasks', 'comments', 'audit'):
            assert exported[field] == previous[field]
        page.reload()
        assert json.loads(saved_snapshot(page))['tasks'] == previous['tasks']
        assert not errors, errors


def test_corrupt_snapshot_is_preserved_during_edits_and_reload(tmp_path):
    with static_site(REPO / 'dist') as url, browser() as b:
        page = b.new_page(viewport={'width': 1440, 'height': 1000})
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(url)
        legacy_tasks = json.loads(saved_snapshot(page))['tasks']
        raw = '{broken snapshot'
        page.evaluate("""({raw, legacyTasks}) => {
            localStorage.setItem('mini-jira:snapshot', raw);
            localStorage.setItem('mini-jira:tasks', JSON.stringify(legacyTasks));
        }""", {'raw': raw, 'legacyTasks': legacy_tasks})
        legacy_raw = page.evaluate("localStorage.getItem('mini-jira:tasks')")
        page.reload()
        expect(page.get_by_role('alert')).to_be_visible()
        assert saved_snapshot(page) == raw
        page.get_by_role('button', name='Zaloguj się', exact=True).click()
        page.locator('#create-title').fill('Unsaved recovery session')
        page.get_by_role('button', name='Dodaj task', exact=True).click()
        expect(page.get_by_role('button', name=re.compile('^Unsaved recovery session MEDIUM'))).to_be_visible()
        assert saved_snapshot(page) == raw
        assert page.evaluate("localStorage.getItem('mini-jira:tasks')") == legacy_raw
        with page.expect_download() as recovery:
            page.get_by_role('button', name='Pobierz oryginalny zapis', exact=True).click()
        recovery_file = tmp_path / 'corrupt-snapshot.json'
        recovery.value.save_as(recovery_file)
        assert json.loads(recovery_file.read_text())['snapshot'] == raw
        page.reload()
        expect(page.get_by_role('alert')).to_be_visible()
        assert saved_snapshot(page) == raw
        assert page.evaluate("localStorage.getItem('mini-jira:tasks')") == legacy_raw
        assert not errors, errors
