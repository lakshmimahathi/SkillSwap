CREATE DATABASE IF NOT EXISTS skillswap;
USE skillswap;
CREATE TABLE IF NOT EXISTS users (
 id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL,
 email VARCHAR(150) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL,
 bio VARCHAR(255) DEFAULT '', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS skills (
 id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL UNIQUE,
 category VARCHAR(80) DEFAULT 'General'
);
CREATE TABLE IF NOT EXISTS user_skills (
 id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, skill_id INT NOT NULL,
 type ENUM('teach','learn') NOT NULL, level ENUM('beginner','intermediate','advanced') DEFAULT 'beginner',
 UNIQUE KEY uq_user_skill_type(user_id,skill_id,type),
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY(skill_id) REFERENCES skills(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS swap_requests (
 id INT AUTO_INCREMENT PRIMARY KEY, sender_id INT NOT NULL, receiver_id INT NOT NULL,
 teach_skill_id INT NOT NULL, learn_skill_id INT NOT NULL,
 status ENUM('pending','accepted','rejected') DEFAULT 'pending',
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(sender_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY(receiver_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY(teach_skill_id) REFERENCES skills(id), FOREIGN KEY(learn_skill_id) REFERENCES skills(id)
);
CREATE TABLE IF NOT EXISTS sessions (
 id INT AUTO_INCREMENT PRIMARY KEY, request_id INT NOT NULL, scheduled_at DATETIME NOT NULL,
 mode ENUM('online','offline') DEFAULT 'online', link_or_place VARCHAR(255) DEFAULT '',
 status ENUM('scheduled','completed','cancelled') DEFAULT 'scheduled',
 FOREIGN KEY(request_id) REFERENCES swap_requests(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS ratings (
 id INT AUTO_INCREMENT PRIMARY KEY, session_id INT NOT NULL, rater_id INT NOT NULL, rated_id INT NOT NULL,
 stars TINYINT NOT NULL, comment VARCHAR(255) DEFAULT '', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 UNIQUE KEY uq_session_rater(session_id,rater_id),
 FOREIGN KEY(session_id) REFERENCES sessions(id) ON DELETE CASCADE,
 FOREIGN KEY(rater_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY(rated_id) REFERENCES users(id) ON DELETE CASCADE
);
INSERT IGNORE INTO skills(name,category) VALUES
('Java','Programming'),('Python','Programming'),('C Programming','Programming'),
('JavaScript','Programming'),('React','Web Development'),('HTML/CSS','Web Development'),
('UI/UX Design','Design'),('Photoshop','Design'),('Graphic Design','Design'),
('Public Speaking','Communication'),('Excel','Productivity'),('SQL','Database');
