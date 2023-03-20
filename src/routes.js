import { Database } from "./database.js";
import { randomUUID } from "node:crypto";
import { buildRoutePath } from "./utils/build-route-path.js";

// - `id` - Identificador único de cada task
// - `title` - Título da task
// - `description` - Descrição detalhada da task
// - `completed_at` - Data de quando a task foi concluída. O valor inicial deve ser `null`
// - `created_at` - Data de quando a task foi criada.
// - `updated_at` - Deve ser sempre alterado para a data de quando a task foi atualizada.

const database = new Database();

const getUpdatedDate = () => {
  const dateTime = new Date();
  return dateTime.toISOString().slice(0, 10);
};

export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const tasks = database.select("tasks");
      return res.end(JSON.stringify(tasks));
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { title, description } = req.body;

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: getUpdatedDate(),
        updated_at: getUpdatedDate(),
      };

      if (title && description) {
        database.insert("tasks", task);
        return res.writeHead(201).end();
      } else {
        return res.writeHead(400).end();
      }
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      const { title, description } = req.body;

      const task = database.selectTask("tasks", id);
      let updatedTask = {};

      if (task) {
        if (title && description) {
          updatedTask = {
            title,
            description,
            updated_at: getUpdatedDate(),
          };
        } else if (!title && !description) {
          return res.writeHead(400).end();
        } else if (!description) {
          updatedTask = {
            title,
            updated_at: getUpdatedDate(),
          };
        } else {
          updatedTask = {
            description,
            updated_at: getUpdatedDate(),
          };
        }
      } else {
        return res.writeHead(404).end();
      }

      database.update("tasks", id, updatedTask);
      return res.writeHead(204).end();
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      database.delete("tasks", id);
      return res.writeHead(204).end();
    },
  },
  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handler: (req, res) => {
      const { id } = req.params;
      const task = database.selectTask("tasks", id);
      let updatedTask = {};
      if (task) {
        if (task.completed_at === null) {
          updatedTask = { completed_at: getUpdatedDate() };
        } else {
          updatedTask = { completed_at: null };
        }
      } else {
        return res.writeHead(404).end();
      }

      database.update("tasks", id, updatedTask);
      return res.writeHead(204).end();
    },
  },
];
