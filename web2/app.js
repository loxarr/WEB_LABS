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
    ['active', 'Невыполненные'],
    ['completed', 'Выполненные'],
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
  emptyMessage.hidden = tasks.length > 0;

  tasks.forEach((task, index) => {
    const item = createElement('li', '', 'task-item');
    const taskTitle = createElement('span', task.title);
    const taskDate = createElement('time', task.date);
    const deleteButton = createElement('button', 'Удалить', 'delete-button');

    taskDate.dateTime = task.date;
    deleteButton.type = 'button';
    deleteButton.setAttribute('aria-label', `Удалить задачу: ${task.title}`);
    deleteButton.addEventListener('click', () => {
      tasks.splice(index, 1);
      renderTasks();
    });

    item.append(taskTitle, taskDate, deleteButton);
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
  });

  form.reset();
  renderTasks();
});
