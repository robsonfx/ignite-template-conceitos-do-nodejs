const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(user => user.username === username);

  if(!user) {
      return response.status(404).json({error: "User nof found"});
  }

  request.user = user;

  return next();
}

//teste OK;
app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const userAlreadyExists = users.find((user) => user.username === username );

  if(userAlreadyExists) {
    return response.status(400).json({error: "User with username already exists!"});
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newUser);

  return response.status(201).json(newUser);

  
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
 
  return response.json(user.todos);
});

//Teste OK
app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const newTodo = {
      id: uuidv4(),
      title: title,
      done: false,
      deadline: new Date(deadline),
      created_at: new Date()
  }

  user.todos.push(newTodo);
  return response.status(201).json(newTodo);
});

//Teste OK
app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todo = user.todos.find(td => td.id === id);

  if(!todo) {
      return response.status(404).json({error: "Resource not found!"})
  }
  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);
});

//Teste OK
app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find(td => td.id === id);

  if(!todo) {
      return response.status(404).json({error: "Resource not found!"})
  }

  todo.done = true;
  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const  { id } = request.params;

  const todoIndex = user.todos.findIndex(td => td.id === id);

  if(todoIndex === -1) {
      return response.status(404).json({error: "Resource not found!"})
  }

  user.todos.splice(todoIndex, 1);

  return response.status(204).send();
});

module.exports = app;