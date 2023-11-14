-- Create the database if it doesn't exist (if applicable)
CREATE DATABASE IF NOT EXISTS sevenify_rest;
-- Use the database
USE sevenify_rest;
-- Create tables
CREATE TABLE IF NOT EXISTS users (
    user_id INT PRIMARY KEY,
    user_name VARCHAR(255) UNIQUE NOT NULL,
    user_premium BOOL NOT NULL DEFAULT 0,
    role ENUM('user', 'admin') NOT NULL
);

CREATE TABLE IF NOT EXISTS albums (
    album_id INT AUTO_INCREMENT PRIMARY KEY,
    album_name VARCHAR(255) NOT NULL,
    album_owner INT NOT NULL,
    FOREIGN KEY (album_owner) REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS music (
    music_id INT AUTO_INCREMENT PRIMARY KEY,
    music_name VARCHAR(255) NOT NULL,
    music_owner INT NOT NULL,
    music_genre VARCHAR(255),
    music_upload_date DATE NOT NULL,
    FOREIGN KEY (music_owner) REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS album_music (
    music_id INT NOT NULL,
    album_id INT NOT NULL,
    PRIMARY KEY (music_id, album_id),
    FOREIGN KEY (music_id) REFERENCES music(music_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (album_id) REFERENCES albums(album_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);