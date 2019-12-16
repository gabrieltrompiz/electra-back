module.exports = {
  registerUser: 'INSERT INTO users(user_fullname, user_username, user_email, user_github_token, user_password, user_picture_url) VALUES($1, $2, $3, $4, $5, $6) RETURNING *;',
  getUserByUsername: 'SELECT * FROM users WHERE user_username = $1'
};