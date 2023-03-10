INSERT INTO departments (department_name)
VALUES  ('Executive'),
        ('Management'),
        ('Accounting'),
        ('Janitorial');

INSERT INTO roles (department_id, title, salary)
VALUES  (1, 'CEO', 300000),
        (1, 'CFO', 280000),
        (2, 'Accounts Manager', 80000),
        (2, 'Janitorial Manager', 75000),
        (3, 'Accounts Payable Processor', 60000),
        (4, 'Night Janitor', 50000),
        (4, 'Day Janitor', 40000);

INSERT INTO employees (role_id, manager_id, first_name, last_name)
VALUES  (1, NULL, 'John', 'Stewart'),
        (2, 1, 'Stephen', 'Colbert'),
        (3, 2, 'John', 'Oliver'),
        (4, 2, 'Hasan', 'Minhaj'),
        (5, 3, 'Ronny', 'Chieng'),
        (6, 4, 'Jimmy', 'Fallon'),
        (7, 4, 'Bill', 'Burr');
