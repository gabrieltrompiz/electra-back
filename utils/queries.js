module.exports = {
  /* USERS */
  registerUser: 'INSERT INTO users(user_fullname, user_username, user_email, user_github_token, user_password, user_picture_url) VALUES($1, $2, $3, $4, $5, $6) RETURNING *;',
  getUserByUsername: 'SELECT * FROM users WHERE user_username = $1;',
  getUserByEmail: 'SELECT * FROM users WHERE user_email = $1;',
  getUserById: 'SELECT * FROM users WHERE user_id = $1;',
  /* WORKSPACES */
  createWorkspace: 'INSERT INTO workspace(workspace_name, workspace_description, workspace_repo_id) VALUES ($1, $2, $3) RETURNING workspace_id;',
  addUserToWorkspace: 'INSERT INTO user_workspace(workspace_id, user_id, type_user_workspace_id) VALUES ($1, $2, $3);',
  getWorkspacesFromUser: 'SELECT w.* FROM workspace w LEFT JOIN user_workspace uw ON uw.user_id = $1 ORDER BY workspace_name;',
  getUsersFromWorkspace: 'SELECT u.*, uw.type_user_workspace_id FROM user_workspace uw INNER JOIN users u ON u.user_id = uw.user_id WHERE uw.workspace_id = $1',
  getSprintFromWorkspace: 'SELECT s.sprint_id, s.sprint_title, s.sprint_start_date, s.sprint_finish_date FROM sprint s INNER JOIN workspace w ON s.workspace_id = w.workspace_id WHERE s.sprint_status = TRUE AND s.workspace_id = $1;',
  getBacklogFromWorkspace: 'SELECT s.sprint_id, s.sprint_title, s.sprint_start_date, s.sprint_finish_date FROM sprint s INNER JOIN workspace w ON s.workspace_id = w.workspace_id WHERE s.sprint_status = FALSE AND s.workspace_id = $1;',
  sendSprintToBacklog: 'UPDATE sprint SET sprint_status = FALSE WHERE sprint_id = $1;',
  createSprint: 'INSERT INTO sprint (workspace_id, sprint_title, sprint_start_date, sprint_finish_date, sprint_status) VALUES ($1, $2, $3, $4, TRUE) RETURNING sprint_id;',
  /* NOTIFICATIONS */
  sendInvitation: 'INSERT INTO notification(user_id, type_notification_id, notification_description, notification_meta, notification_read) VALUES($1, 2, $2, $3, FALSE)',
  getNotifications: 'SELECT * FROM notification WHERE user_id = $1;',
  markAsRead: 'UPDATE notification SET notification_read = TRUE WHERE notification_id = $1 AND user_id = $2;',
  deleteNotification: 'DELETE FROM notification WHERE notification_id = $1 AND user_id = $2;'
};