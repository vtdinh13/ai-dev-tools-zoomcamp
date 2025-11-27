# Question 1
1. Install Django
    - uv add django
2. Check to see if Django is installed
    - uv pip list | grep Django
3. Listing Django in pyproject.toml only records the dependency—it doesn’t install it. After editing pyproject, you still need to sync/install the lockfile into your environment. Do `uv pip sync pyproject.toml`.

# Question 2
1. Create a project with `django-admin startproject mysite` or `python -m django startproject mysite`.
    - creates mysite/ with manage.py and the project package
    - cd mysite
2. Create an app with `python manage.py startapp name_of_app`
    - makes a name_of_app directory with models, views, etc
    - register the app in mysite/settings.py so Django knows about it -- add "name_of_app" to INSTALLED_APPS.
    - run `python manage.py runserver` to start the dev server, create models, migrations, views, etc
 
# Question 3
- A basic Django todo app usually needs just one model to start—a Todo (or Task) 
- Run migration after cerating the data models 

# Question 4
- logic is stored in `views.py`

# Question 5
- base.html: shared site layout
- home.html: landing page that links the todo board to admin area
- registered the directory with the template at `urls.app` 
# To do app
1. Create a project
    - `python -m django startproject todo`
2. Create app
    - python `manage.py startapp todo_app`
3. Register app: add todo_app to INSTALLED_APPS
4. Create models
    - run `python manage.py runserver` to start the dev server
        - migration error: You have 18 unapplied migration(s). 
            - `python manage.py migrate`
        - successful run should look like: 
            ```Watching for file changes with StatReloader
            Performing system checks...```
5. cd to todo_app if not already in the directory
6. Edit the models.py file to include data model; model -> the mapping from python objects to a relational database.
    - Features of the app
        - Create, edit and delete TODOs: Django’s ORM already supports this via views/forms or the admin; no extra fields needed.
        - Assign due dates is nullable
        - Mark TODOs as resolved is boolean
7. Generate migrations: `python manage.py makemigrations todo_app`
8. Apply migrations: `python manage.py migrate`
9. Register the model in admin.py for easy CRUD via admin interface
10. Implement logic
    - python manage.py test: to confirm migration and UI
    - run ui
        - python manage.py migrate; run this once to create tables
        -  python manage.py runserver 8001
11. Added tests; `python manage.py test`
    In `tests.py`:
    - test_list_view_renders_counts – ensures / renders both active/resolved todos and exposes the aggregate counts in context.
    - test_list_filter_active_and_resolved – verifies the status query parameter filters the board view correctly.
    - test_create_view_creates_todo – posts to /new/ and confirms a new todo record is saved.
    - test_update_view_updates_fields – edits an existing todo via /pk/edit/ and checks fields and resolved flag change.
    - test_toggle_view_flips_status – hits /pk/toggle/ to confirm the resolved boolean flips.
    - test_delete_view_removes_record – posts to /pk/delete/ and asserts the todo is removed.
    - test_home_page_loads – loads /home/ and confirms the landing page responds with the expected copy.


## Folders
1. views.py (lines 1-63)
    - all request handling, queries, and toggling lives here. TodoListView builds the dashboard, filtering, and stats; TodoCreateView/TodoUpdateView/TodoDeleteView handle CRUD; TodoToggleResolvedView flips the resolved flag.
2. forms.py (1-12)
    - the TodoForm used by the create/edit views.
3. urls.py (lines 1-17)
    - routes URL paths to those views, and todo/todo/urls.py (lines 17-23) includes them at the project root.
4. templates
    - render the UI (todo_list.html for the dashboard, todo_form.html for create/edit, todo_confirm_delete.html for deletion, all extending base.html).







