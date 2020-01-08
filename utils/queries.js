module.exports = {
  /* USERS */
  registerUser: 'INSERT INTO users(user_fullname, user_username, user_email, user_github_token, user_password, user_picture_url) VALUES($1, $2, $3, $4, $5, $6) RETURNING *;',
  getUserByUsername: 'SELECT * FROM users WHERE user_username = $1;',
  getUserByEmail: 'SELECT * FROM users WHERE user_email = $1;',
  getUserById: 'SELECT * FROM users WHERE user_id = $1;',
  searchUsers: 'SELECT * FROM users WHERE user_id != $2 AND (user_fullname ILIKE $1 OR user_email ILIKE $1 OR user_username ILIKE $1)',
  /* WORKSPACES */
  createWorkspace: 'INSERT INTO workspace(workspace_name, workspace_description, workspace_repo_owner, workspace_repo_name) VALUES ($1, $2, $3, $4) RETURNING workspace_id;',
  addUserToWorkspace: 'INSERT INTO user_workspace(workspace_id, user_id, type_user_workspace_id) VALUES ($1, $2, $3);',
  getWorkspacesFromUser: 'SELECT DISTINCT w.* FROM workspace w LEFT JOIN user_workspace uw ON uw.user_id = $1 ORDER BY workspace_name;',
  getUsersFromWorkspace: 'SELECT u.*, uw.type_user_workspace_id FROM user_workspace uw INNER JOIN users u ON u.user_id = uw.user_id WHERE uw.workspace_id = $1',
  getRepoData: 'SELECT workspace_repo_name, workspace_repo_owner FROM workspace WHERE workspace_id = $1',
  getWorkspace: 'SELECT * FROM workspace WHERE workspace_id = $1;',
  /* SPRINTS */
  getSprintFromWorkspace: 'SELECT s.sprint_id, s.sprint_title, s.sprint_start_date, s.sprint_finish_date FROM sprint s INNER JOIN workspace w ON s.workspace_id = w.workspace_id WHERE s.sprint_status = TRUE AND s.workspace_id = $1;',
  getBacklogFromWorkspace: 'SELECT s.sprint_id, s.sprint_title, s.sprint_start_date, s.sprint_finish_date FROM sprint s INNER JOIN workspace w ON s.workspace_id = w.workspace_id WHERE s.sprint_status = FALSE AND s.workspace_id = $1;',
  sendSprintToBacklog: 'UPDATE sprint SET sprint_status = FALSE WHERE sprint_id = $1;',
  createSprint: 'INSERT INTO sprint (workspace_id, sprint_title, sprint_start_date, sprint_finish_date, sprint_status) SELECT $1, $2, $3, $4, TRUE WHERE NOT EXISTS (SELECT 1 FROM sprint WHERE sprint_status = TRUE AND workspace_id = $1) RETURNING sprint_id;',
  /* TASKS */
  createTask: 'insert into task (task_status_id, sprint_id, task_name, task_description, task_estimated_hours, task_logged_hours, issue_id) values($1, $2, $3, $4, $5, 0, $6) RETURNING task_id;',
  getTask: 'SELECT * FROM task where task_id = $1;',
  getTaskList: 'SELECT * FROM task where sprint_id = $1;',
  getUsersFromTask: 'SELECT u.user_id, u.user_fullname, u.user_username, u.user_picture_url, u.user_email FROM users u INNER JOIN user_task ut ON ut.user_id = u.user_id WHERE task_id = $1;',
  addUserToTask: 'INSERT INTO user_task (user_id, task_id) SELECT $1, $2 WHERE EXISTS (SELECT 1 FROM user_workspace WHERE user_id = $1 AND workspace_id IN (SELECT workspace_id FROM sprint WHERE sprint_id IN (SELECT sprint_id FROM task WHERE task_id = $2))) RETURNING user_id;',
  removeUserFromTask: 'DELETE FROM user_task WHERE user_id = $1 AND task_id = $2;',
  updateTaskStatus: 'UPDATE task SET task_status_id = $1 WHERE task_id = $2;',
  updateTaskHours: 'UPDATE task SET task_logged_hours = task_logged_hours + $1 WHERE task_id = $2;',
  removeAllUsersTask: 'DELETE FROM user_task WHERE task_id = $1;',
  deleteTask: 'DELETE FROM task WHERE task_id = $1;',
  /* NOTIFICATIONS */
  sendInvitation: 'INSERT INTO notification(user_id, type_notification_id, notification_description, notification_meta, notification_read) VALUES($1, 2, $2, $3, FALSE)',
  getNotifications: 'SELECT * FROM notification WHERE user_id = $1;',
  markAsRead: 'UPDATE notification SET notification_read = TRUE WHERE notification_id = $1 AND user_id = $2;',
  deleteNotification: 'DELETE FROM notification WHERE notification_id = $1 AND user_id = $2;'
};