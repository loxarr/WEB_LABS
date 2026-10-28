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

const dateField = createField('Дата', 'date', 'task-date');
dateField.querySelector('input').required = true;

const addButton = createElement('button', 'Добавить');
addButton.type = 'submit';

form.append(titleField, dateField, addButton);
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
  const visibleTasks = [...tasks];

  emptyMessage.hidden = visibleTasks.length > 0;

  if (sortValue === 'date-asc') visibleTasks.sort((a, b) => a.date.localeCompare(b.date));
  if (sortValue === 'date-desc') visibleTasks.sort((a, b) => b.date.localeCompare(a.date));
  if (statusValue === 'active') visibleTasks.sort((a, b) => a.completed - b.completed);
  if (statusValue === 'completed') visibleTasks.sort((a, b) => b.completed - a.completed);

  visibleTasks.forEach((task) => {
    const item = createElement('li', '', 'task-item');
    const checkbox = createElement('input', '', 'task-checkbox');
    const taskTitle = createElement('span', task.title);
    const taskDate = createElement('time', task.date);
    const deleteButton = createElement('button', 'Удалить', 'delete-button');

    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', `Выполнить задачу: ${task.title}`);
    item.classList.toggle('completed', task.completed);
    item.classList.toggle(
      'less-important',
      (statusValue === 'active' && task.completed) ||
      (statusValue === 'completed' && !task.completed),
    );
    taskDate.dateTime = task.date;

    checkbox.addEventListener('change', () => {
      task.completed = checkbox.checked;
      renderTasks();
    });

    deleteButton.type = 'button';
    deleteButton.setAttribute('aria-label', `Удалить задачу: ${task.title}`);
    deleteButton.addEventListener('click', () => {
      tasks.splice(tasks.indexOf(task), 1);
      renderTasks();
    });

    item.append(checkbox, taskTitle, taskDate, deleteButton);
    taskList.append(item);
  });
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const titleInput = document.querySelector('#task-title');
  const dateInput = document.querySelector('#task-date');
  const title = titleInput.value.trim();

  if (!title) {
    titleInput.focus();
    return;
  }

  tasks.push({
    title,
    date: dateInput.value,
    completed: false,
  });

  form.reset();
  renderTasks();
});

document.querySelector('#date-sort').addEventListener('change', renderTasks);
document.querySelector('#status-filter').addEventListener('change', renderTasks);
