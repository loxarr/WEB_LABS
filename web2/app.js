const style = document.createElement('link');
style.rel = 'stylesheet';
style.href = 'styles.css';
document.head.append(style);

function createElement(tag, text, className) {
  const element = document.createElement(tag);
  element.textContent = text || '';
  element.className = className || '';
  return element;
}

function createField(labelText, inputType, inputId, placeholder = '') {
  const field = createElement('div', '', 'field');
  const label = createElement('label', labelText);
  const input = createElement('input');

  label.htmlFor = inputId;
  input.id = inputId;
  input.type = inputType;
  input.placeholder = placeholder;
  field.append(label, input);

  return field;
}

function createSelect(labelText, selectId, options) {
  const field = createElement('div', '', 'field');
  const label = createElement('label', labelText);
  const select = createElement('select');

  label.htmlFor = selectId;
  select.id = selectId;

  options.forEach(([value, text]) => {
    const option = createElement('option', text);
    option.value = value;
    select.append(option);
  });

  field.append(label, select);
  return field;
}

const header = createElement('header');
const title = createElement('h1', 'Список задач');
header.append(title);

const main = createElement('main');

const formSection = createElement('section', '', 'card');
const formTitle = createElement('h2', 'Новая задача');
const form = createElement('form', '', 'task-form');
form.id = 'task-form';

const titleField = createField('Название', 'text', 'task-title', 'Введите задачу');
titleField.querySelector('input').required = true;

const descriptionField = createField('Описание', 'text', 'task-description', 'Добавьте описание');
descriptionField.querySelector('input').required = true;

const dateField = createField('Дата', 'date', 'task-date');
dateField.querySelector('input').required = true;

const addButton = createElement('button', 'Добавить');
addButton.type = 'submit';

form.append(titleField, descriptionField, dateField, addButton);
formSection.append(formTitle, form);

const controls = createElement('section', '', 'controls');
controls.setAttribute('aria-label', 'Настройки списка');
controls.append(
  createField('Поиск', 'search', 'task-search', 'Название задачи'),
  createField('Дата', 'date', 'date-filter'),
  createSelect('Статус', 'status-filter', [
    ['all', 'Все'],
    ['active', 'Сначала невыполненные'],
    ['completed', 'Сначала выполненные'],
  ]),
  createSelect('Сортировка', 'date-sort', [
    ['manual', 'Мой порядок'],
    ['date-asc', 'По дате (возр.)'],
    ['date-desc', 'По дате (убыв.)'],
  ]),
);

const tasksSection = createElement('section', '', 'card');
const tasksTitle = createElement('h2', 'Задачи');
const taskList = createElement('ul', '', 'task-list');
taskList.id = 'task-list';
const emptyMessage = createElement('p', 'Список задач пуст', 'empty-message');
emptyMessage.id = 'empty-message';
tasksSection.append(tasksTitle, taskList, emptyMessage);

main.append(formSection, controls, tasksSection);
document.body.append(header, main);

const tasks = [];

function renderTasks() {
  taskList.replaceChildren();
  const statusValue = document.querySelector('#status-filter').value;
  const sortValue = document.querySelector('#date-sort').value;
  const searchValue = document.querySelector('#task-search').value.trim().toLowerCase();
  const dateValue = document.querySelector('#date-filter').value;
  const visibleTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchValue),
  );
  const getPriority = (task) => {
    let priority = 0;

    if (dateValue && task.date !== dateValue) priority += 1;
    if (statusValue === 'active' && task.completed) priority += 1;
    if (statusValue === 'completed' && !task.completed) priority += 1;

    return priority;
  };

  emptyMessage.hidden = visibleTasks.length > 0;
  emptyMessage.textContent = tasks.length ? 'Задачи не найдены' : 'Список задач пуст';

  if (sortValue === 'date-asc') visibleTasks.sort((a, b) => a.date.localeCompare(b.date));
  if (sortValue === 'date-desc') visibleTasks.sort((a, b) => b.date.localeCompare(a.date));
  visibleTasks.sort((a, b) => getPriority(a) - getPriority(b));

  visibleTasks.forEach((task) => {
    const item = createElement('li', '', 'task-item');
    const checkbox = createElement('input', '', 'task-checkbox');
    const taskContent = createElement('div', '', 'task-content');
    const taskTitle = createElement('strong', task.title);
    const taskDescription = createElement('p', task.description);
    const taskDate = createElement('time', task.date);
    const editButton = createElement('button', 'Изменить', 'edit-button');
    const deleteButton = createElement('button', 'Удалить', 'delete-button');

    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', `Выполнить задачу: ${task.title}`);
    item.classList.toggle('completed', task.completed);
    item.classList.toggle('less-important', getPriority(task) > 0);
    taskDate.dateTime = task.date;
    taskContent.append(taskTitle, taskDescription);

    checkbox.addEventListener('change', () => {
      task.completed = checkbox.checked;
      renderTasks();
    });

    editButton.type = 'button';
    editButton.setAttribute('aria-label', `Изменить задачу: ${task.title}`);
    editButton.addEventListener('click', () => {
      const titleInput = createElement('input', '', 'edit-input');
      const descriptionInput = createElement('input', '', 'edit-input');
      const dateInput = createElement('input', '', 'edit-input edit-date');
      const saveButton = createElement('button', 'Сохранить', 'save-button');
      const cancelButton = createElement('button', 'Отмена', 'cancel-button');

      titleInput.type = 'text';
      titleInput.value = task.title;
      descriptionInput.type = 'text';
      descriptionInput.value = task.description;
      dateInput.type = 'date';
      dateInput.value = task.date;
      saveButton.type = 'button';
      cancelButton.type = 'button';

      saveButton.addEventListener('click', () => {
        const newTitle = titleInput.value.trim();
        const newDescription = descriptionInput.value.trim();

        if (!newTitle) {
          titleInput.focus();
          return;
        }

        if (!newDescription) {
          descriptionInput.focus();
          return;
        }

        if (!dateInput.value) {
          dateInput.focus();
          return;
        }

        task.title = newTitle;
        task.description = newDescription;
        task.date = dateInput.value;
        renderTasks();
      });

      cancelButton.addEventListener('click', renderTasks);
      item.classList.add('editing');
      item.replaceChildren(titleInput, descriptionInput, dateInput, saveButton, cancelButton);
      titleInput.focus();
    });

    deleteButton.type = 'button';
    deleteButton.setAttribute('aria-label', `Удалить задачу: ${task.title}`);
    deleteButton.addEventListener('click', () => {
      tasks.splice(tasks.indexOf(task), 1);
      renderTasks();
    });

    item.append(checkbox, taskContent, taskDate, editButton, deleteButton);
    taskList.append(item);
  });
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const titleInput = document.querySelector('#task-title');
  const descriptionInput = document.querySelector('#task-description');
  const dateInput = document.querySelector('#task-date');
  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();

  if (!title) {
    titleInput.focus();
    return;
  }

  if (!description) {
    descriptionInput.focus();
    return;
  }

  tasks.push({
    title,
    description,
    date: dateInput.value,
    completed: false,
  });

  form.reset();
  renderTasks();
});

document.querySelector('#date-sort').addEventListener('change', renderTasks);
document.querySelector('#status-filter').addEventListener('change', renderTasks);
document.querySelector('#task-search').addEventListener('input', renderTasks);
document.querySelector('#date-filter').addEventListener('change', renderTasks);
