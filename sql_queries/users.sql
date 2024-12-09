drop table if exists users.users_list;
CREATE TABLE users.users_list (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    username VARCHAR(255),
    email VARCHAR(255),
    password_hash VARCHAR(255),  -- Can be used for future password-based logins, if needed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- This table stores addresses saved by users for shipping and billing
drop table if exists users.saved_addresses;
CREATE TABLE users.saved_addresses (
    address_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    address_type ENUM('shipping', 'billing'),
    KEY (user_id)
);

-- This table stores items that users have added to their cart but not yet purchased.
drop table if exists users.cart;
CREATE TABLE users.cart (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    size Varchar(20) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY(user_id),
    KEY(product_id)
);

-- This table stores items that users have added to their wishlist.
drop table if exists users.wishlist;
CREATE TABLE users.wishlist (
    wishlist_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY(user_id),
    KEY(product_id)
);

-- This table stores information about users' orders. 
DROP TABLE IF EXISTS users.orders;
CREATE TABLE users.orders (
order_id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT NOT NULL,
order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
order_status ENUM('created', 'placed', 'failed'),
mrp DECIMAL(10, 2) NOT NULL,
product_discount DECIMAL(10, 2) NOT NULL DEFAULT '0.00',
item_total  DECIMAL(10, 2) NOT NULL,
promo_discount DECIMAL(10, 2) NOT NULL DEFAULT '0.00',
coupon_code varchar(20) NOT NULL DEFAULT '',
delivery_charges INT NOT NULL DEFAULT '0',
extra_charges INT  NOT NULL DEFAULT '0',
extra_charges_name varchar(20) NOT NULL DEFAULT '',
tax_amount  DECIMAL(10, 2) NOT NULL,
total_amount DECIMAL(10, 2) NOT NULL,
payment_status ENUM('pending', 'paid', 'failed'),
transaction_details JSON,
shipping_status ENUM('pending', 'shipped', 'delivered', 'returned'),
shipping_address JSON NOT NULL,
receiver_name varchar(50) NOT NULL,
reciever_contact_no varchar(20) NOT NULL,
delivery_instructions varchar(255) NOT NULL DEFAULT '',
payment_method varchar(20) NOT NULL DEFAULT '',
delivery_date DATETIME,
product_images JSON,
KEY (user_id)
);

-- This table stores details about products in each order.
drop table if exists users.order_items;
CREATE TABLE users.order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_short_name varchar(255),
    brand_name varchar(100),
    quantity INT NOT NULL,
    size varchar(20) NOT NULL,
    selling_price DECIMAL(10, 2) NOT NULL,
	mrp DECIMAL(10, 2) NOT NULL,
	discount_percent DECIMAL(10, 2) NOT NULL,
    images TEXT,
    delivery_man_rating TINYINT default 0,
    KEY(order_id),
    KEY(product_id)
);


-- If users can leave product reviews:
drop table if exists users.user_reviews;
CREATE TABLE users.user_reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_id int NOT NULL,
    product_id INT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    review_image JSON,
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	KEY(user_id),
    KEY(product_id)
);


