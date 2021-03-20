-- sudo mysql -u root < 20210303T222000-create_tables.sql

use yahancheng;

create table users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(30) NOT NULL UNIQUE,
    email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(60),
    token VARCHAR(60) NOT NULL
);

create table messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    channel_id INT,
    user_id INT,
    parent_id INT DEFAULT 0,
    body TEXT,
    time TIMESTAMP
);

create table channels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL UNIQUE,
    user_id INT,
    time TIMESTAMP
);

create table unreads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    channel_id INT NOT NULL,
    last_message_id INT NOT NULL
);
