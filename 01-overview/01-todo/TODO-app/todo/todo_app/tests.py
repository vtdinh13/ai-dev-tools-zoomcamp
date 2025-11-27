from datetime import date

from django.test import TestCase
from django.urls import reverse

from .models import Todo


class TodoViewsTests(TestCase):
    def setUp(self):
        self.todo_active = Todo.objects.create(
            title="Draft blog post",
            notes="Outline sections",
            due_date=date(2025, 1, 31),
            priority=2,
            is_resolved=False,
        )
        self.todo_resolved = Todo.objects.create(
            title="Pay invoices",
            notes="Upload receipts",
            due_date=date(2025, 1, 15),
            priority=1,
            is_resolved=True,
        )

    def test_list_view_renders_counts(self):
        response = self.client.get(reverse("todo-list"))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, self.todo_active.title)
        self.assertContains(response, self.todo_resolved.title)
        totals = response.context["totals"]
        self.assertEqual(totals["total"], 2)
        self.assertEqual(totals["active"], 1)
        self.assertEqual(totals["resolved"], 1)

    def test_list_filter_active_and_resolved(self):
        active_response = self.client.get(reverse("todo-list"), {"status": "active"})
        self.assertContains(active_response, self.todo_active.title)
        self.assertNotContains(active_response, self.todo_resolved.title)

        resolved_response = self.client.get(reverse("todo-list"), {"status": "resolved"})
        self.assertContains(resolved_response, self.todo_resolved.title)
        self.assertNotContains(resolved_response, self.todo_active.title)

    def test_create_view_creates_todo(self):
        payload = {
            "title": "Book flights",
            "notes": "Use travel budget",
            "due_date": "2025-02-01",
            "priority": 3,
            "is_resolved": False,
        }
        response = self.client.post(reverse("todo-create"), data=payload, follow=True)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(Todo.objects.filter(title="Book flights").exists())

    def test_update_view_updates_fields(self):
        payload = {
            "title": "Draft blog post v2",
            "notes": "Add intro",
            "due_date": "2025-02-10",
            "priority": 5,
            "is_resolved": True,
        }
        response = self.client.post(
            reverse("todo-update", args=[self.todo_active.pk]),
            data=payload,
            follow=True,
        )
        self.assertEqual(response.status_code, 200)
        self.todo_active.refresh_from_db()
        self.assertEqual(self.todo_active.title, "Draft blog post v2")
        self.assertTrue(self.todo_active.is_resolved)

    def test_toggle_view_flips_status(self):
        response = self.client.post(reverse("todo-toggle", args=[self.todo_active.pk]), follow=True)
        self.assertEqual(response.status_code, 200)
        self.todo_active.refresh_from_db()
        self.assertTrue(self.todo_active.is_resolved)

    def test_delete_view_removes_record(self):
        response = self.client.post(reverse("todo-delete", args=[self.todo_resolved.pk]), follow=True)
        self.assertEqual(response.status_code, 200)
        self.assertFalse(Todo.objects.filter(pk=self.todo_resolved.pk).exists())


class HomePageTests(TestCase):
    def test_home_page_loads(self):
        response = self.client.get(reverse("home"))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Welcome to Todo Suite")
