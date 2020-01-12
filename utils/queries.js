module.exports = {
  /* USERS */
  registerUser: 'INSERT INTO users(user_fullname, user_username, user_email, user_github_token, user_password, user_picture_url) VALUES($1, $2, $3, $4, $5, $6) RETURNING *;',
  editProfile: 'UPDATE users SET user_fullname = $1, user_username = $2, user_email = $3, user_github_token = $4, user_picture_url = $5 WHERE user_id = $6 RETURNING *;',
  getUserByUsername: 'SELECT * FROM users WHERE user_username = $1;',
  getUserByEmail: 'SELECT * FROM users WHERE user_email = $1;',
  getUserById: 'SELECT * FROM users WHERE user_id = $1;',
  searchUsers: 'SELECT * FROM users WHERE user_id != $2 AND (user_fullname ILIKE $1 OR user_email ILIKE $1 OR user_username ILIKE $1)',
  /* WORKSPACES */
  createWorkspace: 'INSERT INTO workspace(workspace_name, workspace_description, workspace_repo_owner, workspace_repo_name) VALUES ($1, $2, $3, $4) RETURNING workspace_id;',
  editWorkspace: 'UPDATE workspace SET workspace_name = $1, workspace_description = $2, workspace_repo_owner = $3, workspace_repo_name = $4 WHERE workspace_id = $5;',
  addUserToWorkspace: 'INSERT INTO user_workspace(workspace_id, user_id, type_user_workspace_id) VALUES ($1, $2, $3);',
  removeUserFromWorkspace: 'DELETE FROM user_workspace WHERE user_id = $1 AND workspace_id = $2;',
  deleteWorkspace: 'DELETE FROM workspace where workspace_id = $1;',
  getWorkspaceAdmins: 'SELECT * FROM user_workspace WHERE workspace_id = $1 AND type_user_workspace_id = 1;',
  setWorkspaceUserRole: 'UPDATE user_workspace SET type_user_workspace_id = $1 where user_id = $2 AND workspace_id = $3;',
  getWorkspacesFromUser: 'SELECT w.* FROM workspace w INNER JOIN user_workspace uw ON uw.user_id = $1 AND w.workspace_id = uw.workspace_id ORDER BY workspace_name;',
  getUsersFromWorkspace: 'SELECT u.*, uw.type_user_workspace_id FROM user_workspace uw INNER JOIN users u ON u.user_id = uw.user_id WHERE uw.workspace_id = $1',
  getRepoData: 'SELECT workspace_repo_name, workspace_repo_owner FROM workspace WHERE workspace_id = $1',
  getWorkspace: 'SELECT * FROM workspace WHERE workspace_id = $1;',
  isUserWorkspaceMember: 'SELECT * FROM user_workspace WHERE user_id = $1 AND workspace_id = $2;',
  /* SPRINTS */
  getSprintFromWorkspace: 'SELECT s.sprint_id, s.sprint_title, s.sprint_start_date, s.sprint_finish_date FROM sprint s INNER JOIN workspace w ON s.workspace_id = w.workspace_id WHERE s.sprint_status = TRUE AND s.workspace_id = $1;',
  getBacklogFromWorkspace: 'SELECT s.sprint_id, s.sprint_title, s.sprint_start_date, s.sprint_finish_date FROM sprint s INNER JOIN workspace w ON s.workspace_id = w.workspace_id WHERE s.sprint_status = FALSE AND s.workspace_id = $1;',
  sendSprintToBacklog: 'UPDATE sprint SET sprint_status = FALSE WHERE sprint_id = $1 RETURNING workspace_id;',
  createSprint: 'INSERT INTO sprint (workspace_id, sprint_title, sprint_start_date, sprint_finish_date, sprint_status) SELECT $1, $2, $3, $4, TRUE WHERE NOT EXISTS (SELECT 1 FROM sprint WHERE sprint_status = TRUE AND workspace_id = $1) RETURNING sprint_id;',
  /* TASKS */
  createTask: 'insert into task (task_status_id, sprint_id, task_name, task_description, task_estimated_hours, task_logged_hours, issue_id) values($1, $2, $3, $4, $5, 0, $6) RETURNING task_id;',
  getTask: 'SELECT * FROM task where task_id = $1;',
  getTaskList: 'SELECT * FROM task where sprint_id = $1;',
  getUsersFromTask: 'SELECT u.user_id, u.user_fullname, u.user_username, u.user_picture_url, u.user_email FROM users u INNER JOIN user_task ut ON ut.user_id = u.user_id WHERE task_id = $1;',
  addUserToTask: 'INSERT INTO user_task (user_id, task_id) SELECT $1, $2 WHERE EXISTS (SELECT 1 FROM user_workspace WHERE user_id = $1 AND workspace_id IN (SELECT workspace_id FROM sprint WHERE sprint_id IN (SELECT sprint_id FROM task WHERE task_id = $2))) RETURNING user_id;',
  removeUserFromTask: 'DELETE FROM user_task WHERE user_id = $1 AND task_id = $2;',
  updateTaskStatus: 'UPDATE task SET task_status_id = $1 WHERE task_id = $2;',
  updateTaskHours: 'UPDATE task SET task_logged_hours = task_logged_hours + $1 WHERE task_id = $2 RETURNING task_logged_hours AS hours;',
  removeAllUsersTask: 'DELETE FROM user_task WHERE task_id = $1;',
  deleteTask: 'DELETE FROM task WHERE task_id = $1;',
  /* SUBTASKS */
  getSubtasks: 'SELECT * FROM subtask WHERE task_id = $1;',
  createSubtask: 'INSERT INTO subtask (subtask_description, subtask_status, task_id) VALUES ($1, FALSE, $2) RETURNING *;',
  editSubtask: 'UPDATE subtask SET subtask_description = $1 WHERE subtask_id = $2 RETURNING *;',
  setSubtaskStatus: 'UPDATE subtask SET subtask_status = $1 WHERE subtask_id = $2 RETURNING *;',
  deleteSubtask: 'DELETE FROM subtask WHERE subtask_id = $1;',
  /* COMMENTS */
  getComments: 'SELECT c.*, u.user_fullname, u.user_username, u.user_picture_url FROM task_comment c INNER JOIN users u ON u.user_id = c.user_id WHERE task_id = $1;',
  createComment: 'INSERT INTO task_comment (task_id, user_id, comment_description) VALUES ($1, $2, $3) RETURNING *;',
  editComment: 'UPDATE task_comment SET comment_description = $1 WHERE comment_id = $2 RETURNING *;',
  deleteComment: 'DELETE FROM task_comment WHERE comment_id = $1;',
  /* NOTIFICATIONS */
  sendNotification: 'INSERT INTO notification (sender_id, receiver_id, target_id, type_target_id, type_notification_id) VALUES($1, $2, $3, $4, $5);',
  getNotifications: 'SELECT * FROM notification WHERE user_id = $1;',
  markAsRead: 'UPDATE notification SET notification_read = TRUE WHERE notification_id = $1;',
  deleteNotification: 'DELETE FROM notification WHERE notification_id = $1;'
};