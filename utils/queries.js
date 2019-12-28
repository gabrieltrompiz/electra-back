module.exports = {
  registerUser: 'INSERT INTO users(user_fullname, user_username, user_email, user_github_token, user_password, user_picture_url) VALUES($1, $2, $3, $4, $5, $6) RETURNING *;',
  getUserByUsername: 'SELECT * FROM users WHERE user_username = $1;',
  getUserByEmail: 'SELECT * FROM users WHERE user_email = $1;',
  getUserById: 'SELECT * FROM users WHERE user_id = $1;',

  createWorkspace: 'INSERT INTO workspace(workspace_name, workspace_description, workspace_repo_id) VALUES ($1, $2, $3) RETURNING workspace_id;',
  addUserToWorkspace: 'INSERT INTO user_workspace(workspace_id, user_id, type_user_workspace_id) VALUES ($1, $2, $3);',
  getWorkspacesFromUser: 'SELECT w.* FROM workspace w LEFT JOIN user_workspace uw ON uw.user_id = $1 ORDER BY workspace_name;',
  getUsersFromWorkspace: 'SELECT u.*, uw.type_user_workspace_id FROM user_workspace uw INNER JOIN users u ON u.user_id = uw.user_id WHERE uw.workspace_id = $1',
};