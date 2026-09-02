const { authentication, includeBearerToken } = require('./authentication');
const { afters = [] } = require('./middleware');
// const testConnection = require('./triggers/test_connection');
// const newTask = require('./triggers/task');
const createTask = require('./creates/create_task');
const updateTask = require('./creates/update_task');
const createSubstask = require('./creates/create_subtask');
const copyTask = require('./creates/copy_task');
const commentOnTask = require('./creates/comment_on_task');
const moveTaskToSection = require('./creates/move_task_to_section');
const markAsApproved = require('./creates/mark_as_approved');
const markAsDone = require('./creates/mark_as_done');
const workspaceResource = require('./resources/workspaces');
const projectResource = require('./resources/project');
const taskResource = require('./resources/tasks');
const taskFieldsList = require('./resources/task_fields');
const sectionResource = require('./resources/sections');
const userResource = require('./resources/users');
const tagResource = require('./resources/tags');
const taskAdded = require('./triggers/task_added');
const taskUpdated = require('./triggers/task_updated');
const taskCompleted = require('./triggers/task_completed');
const fileAdded = require('./triggers/file_added');
const commentAddedTrigger = require('./triggers/comment_on_task');
const taskMovedToSection = require('./triggers/task_moved_to_section');
const tagAddedToTask = require('./triggers/tag_added_to_task');


module.exports = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,

  authentication,

  beforeRequest: [includeBearerToken],
  afterResponse: [...afters],

  triggers: {
    [taskAdded.key]: taskAdded,
    [taskUpdated.key]: taskUpdated,
    [taskCompleted.key]: taskCompleted,
    [fileAdded.key]: fileAdded,
    [commentAddedTrigger.key]: commentAddedTrigger,
    [taskMovedToSection.key]: taskMovedToSection,
    [tagAddedToTask.key]: tagAddedToTask,
  },
  searches: {},
  creates: {
    [createTask.key]: createTask,
    [updateTask.key]: updateTask,
    [createSubstask.key]: createSubstask,
    [commentOnTask.key]: commentOnTask,
    [copyTask.key]: copyTask,
    [moveTaskToSection.key]: moveTaskToSection,
    [markAsApproved.key]: markAsApproved,
    [markAsDone.key]: markAsDone,
  },
  resources: {
    [workspaceResource.key]: workspaceResource,
    [projectResource.key]: projectResource,
    [taskResource.key]: taskResource,
    [sectionResource.key]: sectionResource,
    [userResource.key]: userResource,
    [tagResource.key]: tagResource,
    [taskFieldsList.key]: taskFieldsList,
  },
};