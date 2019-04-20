const express = require('express');
const authMiddleware = require('../middlewares/auth');
const Project = require('../models/project');
const Task = require('../models/task');

const router = express.Router();

router.use(authMiddleware);
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().populate(['user', 'tasks']);
    return res.send({ projects });
  } catch (error) {
    return res.status(400).send({ error: 'Error loading Project' });
  }
});

router.get('/:projectId', async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.projectId }).populate(['user', 'tasks']);
    return res.send({ project });
  } catch (error) {
    return res.status(400).send({ error: 'Error loading Project' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, tasks } = req.body;

    const project = await Project.create({ title, description, user: req.userId });

    const taskProjectPromises = [];

    tasks.forEach((task) => {
      const taskProject = new Task({ ...task, project: project.id });
      taskProjectPromises.push(taskProject.save());
    });

    const tasksResolved = await Promise.all(taskProjectPromises);

    project.tasks = tasksResolved;

    await project.save();

    return res.send({ project });
  } catch (error) {
    return res.status(400).send({ error: 'Error creating new Project' });
  }
});

router.put('/:projectId', async (req, res) => {
  try {
    const { title, description, tasks } = req.body;

    const project = await Project
      .findByIdAndUpdate(req.params.projectId, { title, description }, { new: true });

    await Task.deleteMany({ project: project.id });


    const taskProjectPromises = [];
    tasks.forEach((task) => {
      const taskProject = new Task({ ...task, project: project.id });
      taskProjectPromises.push(taskProject.save());
    });

    const tasksResolved = await Promise.all(taskProjectPromises);

    project.tasks = tasksResolved;

    await project.save();

    return res.send({ project });
  } catch (error) {
    return res.status(400).send({ error: 'Error updating Project' });
  }
});

router.delete('/:projectId', async (req, res) => {
  try {
    await Project.findOneAndRemove({ _id: req.params.projectId });
    return res.send();
  } catch (error) {
    return res.status(400).send({ error: 'Error deleting new Project' });
  }
});

module.exports = app => app.use('/projects', router);
