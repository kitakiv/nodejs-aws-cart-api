CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(32) NOT NULL CHECK (LENGTH(password) >= 8 AND LENGTH(password) <= 32)
);

create type status_type as enum ('OPEN', 'ORDERED')

CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT null references users(id),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    status status_type not null
);

CREATE TABLE cart_items (
    cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL,
    count INTEGER NOT NULL CHECK (count >= 0),
    PRIMARY KEY (cart_id, product_id)
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID not null references users(id) on delete cascade,
    cart_id UUID NOT NULL REFERENCES carts(id),
    payment JSONB NOT NULL,
    delivery JSONB NOT NULL,
    comments TEXT,
    status status_type NOT NULL,
    total NUMERIC(10,2) NOT NULL CHECK (total >= 0)
);

CREATE OR REPLACE FUNCTION update_cart_status_after_order()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE carts
    SET status = 'ORDERED'
    WHERE id = NEW.cart_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_created_trigger
    AFTER INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_cart_status_after_order();

INSERT INTO users ( name, email, password) VALUES
    ( 'John Doe', 'john@example.com', 'password123'),
    ('Jane Smith', 'jane@example.com', 'securepass456'),
    ('Bob Johnson', 'bob@example.com', 'mysecret789');


INSERT INTO carts (user_id, status) VALUES
    ( '089891ca-6d55-45b0-a0f3-5d9051d9e567', 'OPEN'),
    ('9992e8e8-8c9d-4441-822d-84ac5eeea97b', 'ORDERED'),
    ('d502b555-03f3-4291-9f4b-a3f326fa924a', 'OPEN');

INSERT INTO cart_items (cart_id, product_id, count) VALUES
    ('ae9733f1-9651-4d4e-99a9-bf98283473f5', 'f18a8917-57c5-4a6e-88dc-81538d306147', 2),
    ('e6574378-7a4f-4287-946b-475f4b06d9d3', 'f28a8917-57c5-4a6e-88dc-81538d306148', 1),
    ('b3671f0c-77c8-4c4a-abb4-ef7a002354f5', 'f38a8917-57c5-4a6e-88dc-81538d306149', 3),
    ('b3671f0c-77c8-4c4a-abb4-ef7a002354f5', 'f48a8917-57c5-4a6e-88dc-81538d306150', 1);

INSERT INTO orders (user_id, cart_id, payment, delivery, comments, status, total) VALUES
    (
     '9992e8e8-8c9d-4441-822d-84ac5eeea97b',
     'e6574378-7a4f-4287-946b-475f4b06d9d3',
     '{"method": "credit_card", "card_number": "****1234", "transaction_id": "tx_123456"}',
     '{"address": "123 Main St", "city": "New York", "postal_code": "10001", "type": "home_delivery"}',
     'Please deliver in the evening',
     'ORDERED',
     299.99);
