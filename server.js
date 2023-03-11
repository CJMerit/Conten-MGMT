const express = require('express');
// Import and require mysql2
const mysql = require('mysql2');

const PORT = process.env.PORT || 3001;
const app = express();

const inquirer = require('inquirer');
const cTable = require('console.table');

const initialChoices = [
    'View All Departments',
    'View All Roles',
    'View All Employees',
    'Add A Department',
    'Add A Role',
    'Add An Employee',
    'Update Employee Role',
    'Update Employee Manager',
    'Exit'
]

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
const db = mysql.createConnection(
  {
    host: 'localhost',
    // MySQL username,
    user: 'root',
    password: 'CharElaina@053118',
    database: 'management_db'
  },
  console.log(`Connected to the management_db database.`)
);

app.use((req, res) => {
  res.status(404).end();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



const getDepartments = () => {
  const sql = `SELECT id, department_name AS department FROM departments`;
  
  db.query(sql, (err, rows) => {
    if (err) {
      console.log('Something went wrong!');
       return;
    }
    console.table(rows)
    init()
  });

}

const getRoles = () => {
  const sql = `SELECT roles.id, roles.title, departments.department_name AS department, roles.salary FROM roles LEFT JOIN departments ON roles.department_id = departments.id;`;

  db.query(sql, (err, rows) => {
    if (err) {
      console.log('Something went wrong!');
       return;
    }
    console.table(rows)
    init()
  });
}

const getEmployees = () => {
  const sql = `SELECT employees.id, employees.first_name, employees.last_name, roles.title AS role, departments.department_name AS department, roles.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employees LEFT JOIN roles ON employees.role_id = roles.id LEFT JOIN departments ON roles.department_id = departments.id LEFT JOIN employees manager ON employees.manager_id = manager.id;`;

  db.query(sql, (err, rows) => {
    if (err) {
      console.log('Something went wrong!');
       return;
    }
    console.table(rows)
    init()
  });
}

const addDepartment = () => {
  inquirer
    .prompt([
      {
        type: 'input',
        message: 'Enter department name:',
        name: 'departmentName'
      }
    ])
    .then((res) => {
      const sql = `INSERT INTO departments (department_name)
      VALUES (?)`;
      const params = [res.departmentName];
  
      db.query(sql, params, (err, result) => {
        if (err) {
          console.log('Something went wrong!');
          return;
        }
        console.log(`Added ${res.departmentName} to the database`);
        init()
      });
    });
}

const addRole = () => {
  inquirer
    .prompt([
      {
        type: 'input',
        message: 'Enter role title:',
        name: 'roleTitle'
      },
      {
        type: 'input',
        message: 'Enter role salary:',
        name: 'roleSalary'
      },
      {
        type: 'input',
        message: 'Enter role department:',
        name: 'roleDepartment'
      },  
    ])
    .then((res) => {
      const sqlDep = `SELECT id FROM departments WHERE department_name = '${res.roleDepartment}'`;
      db.query(sqlDep, (err, result) => {
        if (err) {
          console.log('Something went wrong!');
          return;
        }

        const sqlRole = `INSERT INTO roles (department_id, title, salary)
        VALUES (?, ?, ?)`;
        const params = [result[0].id, res.roleTitle, res.roleSalary];
  
        db.query(sqlRole, params, (err, result) => {
          if (err) {
            console.log('Something went wrong!');
            return;
          }
          console.log(`Added ${res.roleTitle} to the database`);
          init()
        });
      })
    })
}

const addEmployee = (roleSelect, employees) => {
  inquirer
    .prompt([
      {
        type: 'input',
        message: "Enter employee's first name:",
        name: 'employeeFirstName'
      },
      {
        type: 'input',
        message: "Enter employee's last name:",
        name: 'employeeLastName'
      },
      {
        type: 'list',
        message: 'Select Role',
        choices: roleSelect,
        name: 'employeeRole'
      },
      {
        type: 'list',
        message: "Select employee's manager:",
        choices: employees,
        name: 'employeeManager'
      }
    ])
    .then((res) => {
      let managerName = res.employeeManager.split(' ')

      const sqlRole = `SELECT roles.id AS roles_id FROM roles WHERE roles.title = '${res.employeeRole}';`;

      db.query(sqlRole, (err, roleRes) => {
        if (err) {
          console.log('Something went wrong!');
          return;
        }

        const sqlManager = `SELECT employees.id AS employees_id FROM employees WHERE employees.first_name = '${managerName[0]}' AND employees.last_name = '${managerName[1]}'`

        db.query(sqlManager, (err, managerRes) => {
          if (err) {
            console.log('Something went wrong!');
            return;
          }

          const sqlEmp = `INSERT INTO employees (role_id, manager_id, first_name, last_name)
          VALUES (?, ?, ?, ?)`;
          const params = [roleRes[0].roles_id, managerRes[0].employees_id, res.employeeFirstName, res.employeeLastName];
    
          db.query(sqlEmp, params, (err, empResult) => {
            if (err) {
              console.log('Something went wrong!');
              return;
            }
            console.log(`Added ${res.employeeFirstName} ${res.employeeLastName} to the database`)
            init()
          });
        })
      });
    })

}

const updateEmployeeRole = (roleSelect, employees) => {
  inquirer
    .prompt([
      {
        type: 'list',
        message: "Select employee to change:",
        choices: employees,
        name: 'employeeName'
      },
      {
        type: 'list',
        message: "Select employee's new role:",
        choices: roleSelect,
        name: 'employeeNewRole'
      }
    ])
    .then((res) => {
      let name = res.employeeName.split(' ')
      const sqlEmp = `SELECT employees.id AS employees_id FROM employees WHERE employees.first_name = '${name[0]}' AND employees.last_name = '${name[1]}'`

      db.query(sqlEmp, (err, empRes) => {
        if (err) {
          console.log('Something went wrong!');
          return;
        }
        
        const sqlRole = `SELECT roles.id AS roles_id FROM roles WHERE roles.title = '${res.employeeNewRole}';`;

        db.query(sqlRole, (err, roleRes) => {
          if (err) {
            console.log('Something went wrong!');
            return;
          }

          const sqlUpdateRole = `UPDATE employees SET role_id = ? WHERE id = ?;`
          const params = [roleRes[0].roles_id, empRes[0].employees_id,];
    
          db.query(sqlUpdateRole, params, (err, result) => {
            if (err) {
              console.log('Something went wrong!');
              return;
            }
            console.log(`Updated ${name[0]} ${name[1]}'s role`)
            init();
        })
      })
    })
  })
};

const updateEmployeeManager = (employees) => {
  inquirer
    .prompt([
      {
        type: 'list',
        message: "Select employee to change:",
        choices: employees,
        name: 'employeeName'
      },
      {
        type: 'list',
        message: "Select employee's new manager:",
        choices: employees,
        name: 'managerName'
      }
    ])
    .then((res) => {
      let empName = res.employeeName.split(' ')
      const sqlEmp = `SELECT employees.id AS employees_id FROM employees WHERE employees.first_name = '${empName[0]}' AND employees.last_name = '${empName[1]}'`
      
      db.query(sqlEmp, (err, empRes) => {
        if (err) {
          console.log('Something went wrong!');
          return;
        }

        let managerName = res.managerName.split(' ')
        const sqlManager = `SELECT employees.id AS employees_id FROM employees WHERE employees.first_name = '${managerName[0]}' AND employees.last_name = '${managerName[1]}'`

        db.query(sqlManager, (err, managerRes) => {
          if (err) {
            console.log('Something went wrong!');
            return;
          }
          
          const sqlUpdateManager = `UPDATE employees SET manager_id = ? WHERE id = ?;`
          const params = [managerRes[0].employees_id, empRes[0].employees_id];

          db.query(sqlUpdateManager, params, (err, result) => {
            if (err) {
              console.log('Something went wrong!');
              return;
            }
            console.log(`Set ${managerName[0]} ${managerName[1]} as ${empName[0]} ${empName[1]}'s manager`)
            init()
          })
        })
      })
    })
}

const init = () => {
  let roleSelect = [];
  let employees = [];
  const sqlRoles = `SELECT roles.title FROM roles;`

  db.query(sqlRoles, (err, result) => {
    if (err) {
      console.log('Something went wrong!');
      return;
    }
    for(i = 0; i < result.length; i++) {
      roleSelect.push(result[i].title)
    }
  });
  const sqlEmployees = `SELECT employees.first_name, employees.last_name FROM employees;`

  db.query(sqlEmployees, (err, result) => {
    if (err) {
      console.log('Something went wrong!');
      return;
    }
    for(i = 0; i < result.length; i++) {
      let empName = `${result[i].first_name} ${result[i].last_name}`
      employees.push(empName)
    }
  });
  inquirer
    .prompt([
      {
        type: 'list',
        message: 'Select One',
        choices: initialChoices,
        name: 'initial'
      }
    ])
    .then((res) => {
      switch (res.initial) {
        case 'View All Departments':
          getDepartments();
          break;
        case 'View All Roles':
          getRoles();
          break;
        case 'View All Employees':
          getEmployees();
          break;
        case 'Add A Department':
          addDepartment();
          break;
        case 'Add A Role':
          addRole();
          break;
        case 'Add An Employee':
          addEmployee(roleSelect, employees);
          break;
        case 'Update Employee Role':
          updateEmployeeRole(roleSelect, employees);
          break;
        case 'Update Employee Manager':
          updateEmployeeManager(employees);
          break;
        case 'Exit':
          process.exit(0)
      }
    })
}

init()