from django import forms

from .models import Todo


class TodoForm(forms.ModelForm):
  class Meta:
    model = Todo
    fields = ["title", "notes", "due_date", "priority", "is_resolved"]
    widgets = {
        "due_date": forms.DateInput(attrs={"type": "date"}),
    }
