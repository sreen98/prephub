import type { SqlDataset, MongoDataset } from './types';

/**
 * Seed data for the Query Playground.
 *
 * Deliberately small — every row is visible in the schema panel, so a wrong
 * answer can be reasoned about by hand rather than guessed at. The shapes are
 * the ones interview questions actually use: employees/departments for joins
 * and window functions, orders/customers for aggregation, and a nested
 * orders collection for MongoDB pipelines.
 */

export const HR_DATASET: SqlDataset = {
  id: 'hr',
  name: 'HR — employees & departments',
  tables: [
    { name: 'departments', columns: ['id int', 'name text', 'budget numeric'] },
    {
      name: 'employees',
      columns: ['id int', 'name text', 'dept_id int', 'manager_id int', 'salary numeric', 'hired date'],
      note: 'manager_id is a self-reference to employees.id and is NULL for the CEO.',
    },
  ],
  setup: `
CREATE TABLE departments (id int PRIMARY KEY, name text NOT NULL, budget numeric);
CREATE TABLE employees (
  id int PRIMARY KEY,
  name text NOT NULL,
  dept_id int REFERENCES departments(id),
  manager_id int,
  salary numeric NOT NULL,
  hired date NOT NULL
);

INSERT INTO departments VALUES
  (1,'Engineering',2000000),(2,'Sales',900000),(3,'Design',450000),(4,'Legal',NULL);

INSERT INTO employees VALUES
  (1,'Barbara Liskov',  1, NULL, 210000,'2015-01-12'),
  (2,'Ada Lovelace',    1, 1,    150000,'2017-03-01'),
  (3,'Grace Hopper',    1, 1,    150000,'2016-07-15'),
  (4,'Alan Turing',     1, 2,    120000,'2019-09-30'),
  (5,'Katherine Johnson',2,1,    130000,'2018-02-20'),
  (6,'Mary Jackson',    2, 5,    135000,'2020-11-05'),   -- earns MORE than her manager (5)
  (7,'Dorothy Vaughan', 2, 5,     98000,'2021-06-14'),
  (8,'Radia Perlman',   3, 1,    140000,'2016-04-02'),
  (9,'Hedy Lamarr',     3, 8,     88000,'2022-08-19'),
  (10,'Margaret Hamilton',NULL,1, 210000,'2014-05-30');
-- NOTE: Barbara and Margaret deliberately TIE on the top salary (210000), and
-- Ada and Grace tie on 150000. Without a tie at the very top, the classic
-- "second highest" question would accept the wrong answer: ORDER BY salary
-- DESC OFFSET 1 would return the same value as the correct DISTINCT version,
-- so the question would not test what it claims to.
-- Mary Jackson (6) deliberately out-earns her manager Katherine (5). A senior
-- IC paid above their manager is common in real orgs, and without one row like
-- it the "employees earning more than their manager" question returns nothing.
`,
};

export const SHOP_DATASET: SqlDataset = {
  id: 'shop',
  name: 'Shop — customers, orders & items',
  tables: [
    { name: 'customers', columns: ['id int', 'name text', 'country text', 'signed_up date'] },
    { name: 'orders', columns: ['id int', 'customer_id int', 'status text', 'placed_at date'] },
    { name: 'order_items', columns: ['order_id int', 'product text', 'qty int', 'unit_price numeric'] },
  ],
  setup: `
CREATE TABLE customers (id int PRIMARY KEY, name text, country text, signed_up date);
CREATE TABLE orders (id int PRIMARY KEY, customer_id int REFERENCES customers(id), status text, placed_at date);
CREATE TABLE order_items (order_id int REFERENCES orders(id), product text, qty int, unit_price numeric);

INSERT INTO customers VALUES
  (1,'Ada','UK','2023-01-10'),(2,'Grace','US','2023-02-14'),
  (3,'Linus','FI','2023-03-02'),(4,'Margaret','US','2024-01-05'),
  (5,'Radia','US','2024-06-30');           -- has never ordered

INSERT INTO orders VALUES
  (100,1,'shipped','2024-01-15'),(101,1,'shipped','2024-02-20'),
  (102,2,'shipped','2024-02-25'),(103,2,'cancelled','2024-03-01'),
  (104,3,'pending','2024-03-11'),(105,4,'shipped','2024-04-02'),
  (106,1,'pending','2024-05-19');

INSERT INTO order_items VALUES
  (100,'Keyboard',1,80),(100,'Mouse',2,25),
  (101,'Monitor',2,300),
  (102,'Keyboard',3,80),(102,'Cable',5,9),
  (103,'Monitor',1,300),
  (104,'Mouse',1,25),
  (105,'Desk',1,450),(105,'Lamp',2,40),
  (106,'Cable',10,9);
`,
};

export const SQL_DATASETS: SqlDataset[] = [HR_DATASET, SHOP_DATASET];

// ---------------------------------------------------------------------------
// MongoDB
// ---------------------------------------------------------------------------

export const MONGO_SHOP: MongoDataset = {
  id: 'mongo-shop',
  name: 'Shop — orders with embedded items',
  collections: {
    orders: [
      { _id: 1, customer: 'Ada', country: 'UK', status: 'shipped', placedAt: '2024-01-15',
        items: [{ sku: 'KB', name: 'Keyboard', qty: 1, price: 80 }, { sku: 'MS', name: 'Mouse', qty: 2, price: 25 }] },
      { _id: 2, customer: 'Ada', country: 'UK', status: 'shipped', placedAt: '2024-02-20',
        items: [{ sku: 'MN', name: 'Monitor', qty: 2, price: 300 }] },
      { _id: 3, customer: 'Grace', country: 'US', status: 'shipped', placedAt: '2024-02-25',
        items: [{ sku: 'KB', name: 'Keyboard', qty: 3, price: 80 }, { sku: 'CB', name: 'Cable', qty: 5, price: 9 }] },
      { _id: 4, customer: 'Grace', country: 'US', status: 'cancelled', placedAt: '2024-03-01',
        items: [{ sku: 'MN', name: 'Monitor', qty: 1, price: 300 }] },
      { _id: 5, customer: 'Linus', country: 'FI', status: 'pending', placedAt: '2024-03-11',
        items: [{ sku: 'MS', name: 'Mouse', qty: 1, price: 25 }] },
      { _id: 6, customer: 'Margaret', country: 'US', status: 'shipped', placedAt: '2024-04-02',
        items: [{ sku: 'DK', name: 'Desk', qty: 1, price: 450 }, { sku: 'LP', name: 'Lamp', qty: 2, price: 40 }] },
      { _id: 7, customer: 'Ada', country: 'UK', status: 'pending', placedAt: '2024-05-19',
        items: [{ sku: 'CB', name: 'Cable', qty: 10, price: 9 }] },
      // Deliberately constructed for the $elemMatch question: a Cable with a
      // SMALL qty next to a different item with a large one. Without this
      // order, the naive `{ "items.sku": "CB", "items.qty": { $gte: 5 } }`
      // returns the same rows as the correct $elemMatch query, and the
      // question would not test what it claims to.
      { _id: 8, customer: 'Linus', country: 'FI', status: 'shipped', placedAt: '2024-06-01',
        items: [{ sku: 'CB', name: 'Cable', qty: 1, price: 9 }, { sku: 'MS', name: 'Mouse', qty: 6, price: 25 }] },
    ],
    // Mirrors the SQL `employees` table so the hierarchy questions ($graphLookup
    // vs WITH RECURSIVE) can be compared directly across the two engines.
    employees: [
      { _id: 1, name: 'Barbara Liskov', managerId: null, dept: 'Engineering', salary: 210000 },
      { _id: 2, name: 'Ada Lovelace', managerId: 1, dept: 'Engineering', salary: 150000 },
      { _id: 3, name: 'Grace Hopper', managerId: 1, dept: 'Engineering', salary: 150000 },
      { _id: 4, name: 'Alan Turing', managerId: 2, dept: 'Engineering', salary: 120000 },
      { _id: 5, name: 'Katherine Johnson', managerId: 1, dept: 'Sales', salary: 130000 },
      { _id: 6, name: 'Mary Jackson', managerId: 5, dept: 'Sales', salary: 95000 },
    ],
    customers: [
      { _id: 'Ada', country: 'UK', tier: 'gold', signedUp: '2023-01-10' },
      { _id: 'Grace', country: 'US', tier: 'silver', signedUp: '2023-02-14' },
      { _id: 'Linus', country: 'FI', tier: 'silver', signedUp: '2023-03-02' },
      { _id: 'Margaret', country: 'US', tier: 'gold', signedUp: '2024-01-05' },
      { _id: 'Radia', country: 'US', tier: 'bronze', signedUp: '2024-06-30' },
    ],
  },
};

export const MONGO_DATASETS: MongoDataset[] = [MONGO_SHOP];

export function sqlDataset(id: string): SqlDataset | undefined {
  return SQL_DATASETS.find((d) => d.id === id);
}
export function mongoDataset(id: string): MongoDataset | undefined {
  return MONGO_DATASETS.find((d) => d.id === id);
}
