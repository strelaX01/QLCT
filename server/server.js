const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const moment = require('moment');


const JWT_SECRET = 'your_jwt_secret';

// Kết nối đến CSDL MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'qlct'
});

db.connect((err) => {
    if (err) {
        console.error('Lỗi kết nối: ' + err.message);
        return;
    }
    console.log('Kết nối thành công');
});



// Sử dụng middleware để parse JSON từ request body
app.use(express.json());

let activeTokens = []; 


// Route đăng ký người dùng
app.post('/register', async (req, res) => {
    const { email, name, password, repassword } = req.body;

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    const validatePassword = (password) => {
        const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
        return re.test(password);
    };

    if (!email || !name || !password || !repassword) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
    } else if (!validateEmail(email)) {
        return res.status(408).json({ message: 'Email không hợp lệ' });
    } else if (!email) {
        return res.status(407).json({ message: 'Email không được để trống' });
    } else if (!name) {
        return res.status(402).json({ message: 'Tên đăng nhập không được để trống' });
    } else if (name.length < 3 || name.length > 30) {
        return res.status(409).json({ message: 'Tên đăng nhập phải có từ 3 đến 30 ký tự' });
    } else if (!password) {
        return res.status(403).json({ message: 'Mật khẩu không được để trống' });
    } else if (!validatePassword(password)) {
        return res.status(410).json({ message: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số' });
    } else if (!repassword) {
        return res.status(406).json({ message: 'Mật khẩu nhập lại không được để trống' });
    }
    if (password !== repassword) {
        return res.status(401).json({ message: 'Mật khẩu và mật khẩu nhập lại không khớp' });
    }

    try {
        // Kiểm tra xem tên đăng nhập đã tồn tại trong CSDL chưa
        db.query('SELECT * FROM Users WHERE email = ?', [email], async (err, results) => {
            if (err) {
                console.error('Lỗi truy vấn cơ sở dữ liệu', err);
                return res.status(500).json({ message: 'Đăng ký thất bại' });
            }

            if (results.length > 0) {
                console.log('Email đã được đăng ký', email);
                return res.status(400).json({ message: 'Email đã được đăng ký' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            // Thực hiện thêm người dùng mới vào CSDL
            const insertQuery = 'INSERT INTO users (email ,username, password) VALUES (?, ?, ?)';
            db.query(insertQuery, [email, name, hashedPassword, new Date()], (err, results) => {
                if (err) {
                    console.error('Lỗi thêm vào cơ sở dữ liệu', err);
                    return res.status(500).json({ message: 'Đăng ký thất bại' });
                }
                return res.status(201).json({ message: 'Người dùng đăng ký thành công', user: { id: results.insertId, name } });
            });

        });
    } catch (error) {
        console.error('Lỗi trong quá trình xử lý mật khẩu', error.message);
        res.status(500).json({ message: 'Đăng ký thất bại' });
    }
});


app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    if (!email || !password) {
        return res.status(400).json({ message: 'Email và mật khẩu không được để trống' });
    } else if (!validateEmail(email)) {
        return res.status(408).json({ message: 'Email không hợp lệ' });
    }

    try {
        const results = await queryAsync('SELECT * FROM users WHERE email = ?', [email]);

        if (results.length === 0) {
            return res.status(400).json({ message: 'Email không tồn tại' });
        }

        const user = results[0];

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Mật khẩu không hợp lệ' });
        }

        // Tạo token JWT
        const token = jwt.sign({ userId: user.user_id }, JWT_SECRET, { expiresIn: '1h' });

        activeTokens.push(token);


        res.status(200).json({ message: 'Đăng nhập thành công', token, userId: user.user_id });

    } catch (error) {
        console.error('Lỗi trong quá trình xử lý đăng nhập', error.message);
        res.status(500).json({ message: 'Đăng nhập thất bại' });
    }
});

// Endpoint logout with delete token
app.post('/logout', (req, res) => {
    const token = req.headers['authorization'];

    if (token) {
        activeTokens = activeTokens.filter(t => t !== token);
        return res.status(200).json({ message: 'Đăng xuất thành công' });
    }

    res.status(400).json({ message: 'Không có token để đăng xuất' });
});

//get username
app.get('/getusername/:userId', async (req, res) => {
    const { userId } = req.params;
    console.log('userId la', userId);
    try {
        const results = await queryAsync('SELECT * FROM users WHERE user_id = ?', [userId]);
        console.log('results', results);
        res.status(200).json(results[0]);
    } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
        res.status(500).json({ error: 'Lỗi khi lấy thông tin người dùng' });
    }
});

//edit username
app.post('/updateusername', (req, res) => {
    const { userId, username } = req.body;

    if (!username) {
        return res.status(400).json({ error: 'username là bắt buộc' });
    }

    const query = 'UPDATE users SET username = ? WHERE id = ?';
    db.query(query, [username, userId], (err, result) => {
        if (err) {
            console.error('Lỗi khi cập nhật tên người dùng:', err);
            return res.status(500).json({ error: 'Lỗi khi cập nhật tên người dùng' });
        }

        res.status(200).json({ message: 'Tên người dùng đã được cập nhật thành công' });
    });
});
//save category
app.post('/AddIncomeCategory', async (req, res) => {
    const { name, color, icon, userId } = req.body;

    if (!name) {
        return res.status(401).json({ message: 'Vui lòng điền tên mục thu nhập.' });
    } else if (!color) {
        return res.status(402).json({ message: 'Vui lòng chọn màu cho mục thu nhập.' });
    } else if (!icon) {
        return res.status(403).json({ message: 'Vui lòng chọn icon cho mục thu nhập.' });
    }

    try {
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const insertQuery = `
            INSERT INTO income_categories (user_id, category_name, color, icon) 
            VALUES ( ?, ?, ?, ?)
        `;
        const result = await queryAsync(insertQuery, [userId, name, color, icon]);

        res.status(201).json({
            id: result.insertId,
            user_id: userId,
            name,
            color,
            icon
        });
    } catch (error) {
        console.error('Lỗi khi tạo mục:', error);
        res.status(500).json({ error: 'Lỗi khi tạo mục' });
    }
});

app.post('/UpdateIncomeCategory', async (req, res) => {
    const { id, name, color, icon } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'Category ID is required' });
    }

    try {
        const updateQuery = `
            UPDATE income_categories
            SET category_name = ?, color = ?, icon = ?
            WHERE id = ?
        `;
        const result = await queryAsync(updateQuery, [name, color, icon, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Danh mục không tồn tại' });
        }

        res.status(200).json({
            message: 'Danh mục thu nhập đã cập nhật thành công',
            id,
            name,
            color,
            icon,
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật danh mục:', error);
        res.status(500).json({ error: 'Lỗi khi cập nhật danh mục' });
    }
});

//delete income 
app.delete('/deleteincome/:incomeId', (req, res) => {
    const { incomeId } = req.params;


    if (!incomeId) {
        return res.status(400).send('Income ID is required');
    }

    const deleteQuery = 'DELETE FROM income WHERE id = ?';

    db.query(deleteQuery, [incomeId], (err, result) => {
        if (err) {
            console.error('Error deleting income:', err);
            return res.status(500).send('Internal Server Error');
        }

        if (result.affectedRows === 0) {
            return res.status(404).send('Income not found');
        }

        res.status(200).send('Income deleted successfully');
    });
});


app.delete('/deleteexpense/:incomeId', (req, res) => {
    const { incomeId } = req.params;

    if (!incomeId) {
        return res.status(400).send('Income ID is required');
    }

    const deleteQuery = 'DELETE FROM expense WHERE id = ?';

    db.query(deleteQuery, [incomeId], (err, result) => {
        if (err) {
            console.error('Error deleting income:', err);
            return res.status(500).send('Internal Server Error');
        }

        if (result.affectedRows === 0) {
            return res.status(404).send('Expense not found');
        }

        res.status(200).send('Expense deleted successfully');
    });
});


app.post('/UpdateExpenseCategory', async (req, res) => {
    const { id, name, color, icon } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'Category ID is required' });
    }

    try {
        const updateQuery = `
            UPDATE expense_categories
            SET category_name = ?, color = ?, icon = ?
            WHERE id = ?
        `;
        const result = await queryAsync(updateQuery, [name, color, icon, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Danh mục không tồn tại' });
        }

        res.status(200).json({
            message: 'Danh mục thu nhập đã cập nhật thành công',
            id,
            name,
            color,
            icon,
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật danh mục:', error);
        res.status(500).json({ error: 'Lỗi khi cập nhật danh mục' });
    }
});



app.post('/AddExpenseCategory', async (req, res) => {
    const { name, color, icon, userId } = req.body;

    if (!name) {
        return res.status(401).json({ message: 'Vui lòng điền tên mục thu nhập.' });
    } else if (!color) {
        return res.status(402).json({ message: 'Vui lòng chọn màu cho mục thu nhập.' });
    } else if (!icon) {
        return res.status(403).json({ message: 'Vui lòng chọn icon cho mục thu nhập.' });
    }

    try {
        const insertQuery = `
            INSERT INTO expense_categories (user_id, category_name, color, icon) 
            VALUES ( ?, ?, ?, ?)
        `;
        const result = await queryAsync(insertQuery, [userId, name, color, icon]);

        res.status(201).json({
            id: result.insertId,
            user_id: userId,
            name,
            color,
            icon
        });
    } catch (error) {
        console.error('Lỗi khi tạo mục:', error);
        res.status(500).json({ error: 'Lỗi khi tạo mục' });
    }
});

app.post('/GetIncomeCategories', async (req, res) => {
    const { userId } = req.body;

    try {
        const selectQuery = 'SELECT * FROM income_categories WHERE user_id = ?';
        const results = await queryAsync(selectQuery, [userId]);

        res.status(200).json(results);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách mục:', error);
        res.status(500).json({ error: 'Lỗi khi lấy danh sách mục' });
    }
});

app.post('/GetExpenseCategories', async (req, res) => {
    const { userId } = req.body;

    try {
        const selectQuery = 'SELECT * FROM expense_categories WHERE user_id = ?';
        const results = await queryAsync(selectQuery, [userId]);

        res.status(200).json(results);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách mục:', error);
        res.status(500).json({ error: 'Lỗi khi lấy danh sách mục' });
    }
});


app.get('/getMonthlyExpenseReport/:categoryId', async (req, res) => {
    const { userId } = req.query;
    const { categoryId } = req.params;
    const { year } = req.query;
    console.log('userId', userId);
    console.log('categoryId', categoryId);
    console.log('year', year);

    try {
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`
        console.log('startDate', startDate);
        console.log('endDate', endDate);

        const selectQuery = `
            SELECT *
            FROM expense
            WHERE user_id = ? AND category_id = ? AND date BETWEEN ? AND ?
            ORDER BY date;
        `;
        const results = await queryAsync(selectQuery, [userId, categoryId, startDate, endDate]);
        console.log('results', results);

        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching monthly report:', error);
        res.status(500).json({ error: 'Error fetching monthly report' });
    }
});

app.get('/getEachMonthlyExpenseReport/:categoryId', async (req, res) => {
    const { userId } = req.query;
    const { categoryId } = req.params;
    const { year, month } = req.query;
    console.log('data', userId, categoryId, year, month);
  
    try {

      const startDate = `${year}-${month}-01`;
      const endDate = moment(startDate).endOf('month').format('YYYY-MM-DD');
  
      const selectQuery = `
        SELECT *
        FROM Expense
        WHERE user_id = ? AND category_id = ? AND date >= ? AND date <= ?
        ORDER BY date;
      `;
      const results = await queryAsync(selectQuery, [userId, categoryId, startDate, endDate]);
      console.log('results', results);
  
      res.status(200).json(results);
    } catch (error) {
      console.error('Error fetching monthly expense report:', error);
      res.status(500).json({ error: 'Error fetching monthly expense report' });
    }
  });
  


app.get('/getMonthlyIncomeReport/:categoryId', async (req, res) => {
    const { userId } = req.query;
    const { categoryId } = req.params;
    const { year } = req.query;
    try {

        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;


        const selectQuery = `
            SELECT *
            FROM income
            WHERE user_id = ? AND category_id = ? AND date BETWEEN ? AND ?
            ORDER BY date;
        `;
        const results = await queryAsync(selectQuery, [userId, categoryId, startDate, endDate]);

        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching monthly report:', error);
        res.status(500).json({ error: 'Error fetching monthly report' });
    }
});


app.get('/getYearlyIncomeReport/:categoryId', async (req, res) => {
    const { userId } = req.query;
    const { categoryId } = req.params;
    const { year } = req.query;
    try {

        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;

        const selectQuery = `
            SELECT *
            FROM income
            WHERE user_id = ? AND category_id = ? AND date BETWEEN ? AND ?
            ORDER BY date;
        `;
        const results = await queryAsync(selectQuery, [userId, categoryId, startDate, endDate]);

        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching monthly report:', error);
        res.status(500).json({ error: 'Error fetching monthly report' });
    }
});

app.get('/getYearlyExpenseReport/:categoryId', async (req, res) => {
    const { userId } = req.query;
    const { categoryId } = req.params;
    const { year } = req.query;
    try {
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;

        const selectQuery = `
            SELECT *
            FROM expense
            WHERE user_id = ? AND category_id = ? AND date BETWEEN ? AND ?
            ORDER BY date;
        `;
        const results = await queryAsync(selectQuery, [userId, categoryId, startDate, endDate]);

        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching monthly report:', error);
        res.status(500).json({ error: 'Error fetching monthly report' });
    }
});


app.get('/getEachMonthlyIncomeReport/:categoryId', async (req, res) => {
    const { userId } = req.query;
    const { categoryId } = req.params;
    const { year, month } = req.query;
    console.log('data', userId, categoryId, year, month);
  
    try {

      const startDate = `${year}-${month}-01`;
      const endDate = moment(startDate).endOf('month').format('YYYY-MM-DD');
  

      const selectQuery = `
        SELECT *
        FROM income
        WHERE user_id = ? AND category_id = ? AND date >= ? AND date <= ?
        ORDER BY date;
      `;
      const results = await queryAsync(selectQuery, [userId, categoryId, startDate, endDate]);
      console.log('results', results);
  

      res.status(200).json(results);
    } catch (error) {
      console.error('Error fetching monthly income report:', error);
      res.status(500).json({ error: 'Error fetching monthly income report' });
    }
  });
  


app.post('/DeleteIncomeCategory', (req, res) => {
    const { categoryId } = req.body;


    if (!categoryId) {
        return res.status(400).send('Category ID is required');
    }

    const deleteQuery = 'DELETE FROM income_categories WHERE id = ?';

    db.query(deleteQuery, [categoryId], (err, result) => {
        if (err) {
            console.error('Error deleting category:', err);
            return res.status(500).send('Internal Server Error');
        }

        if (result.affectedRows === 0) {
            return res.status(404).send('Category not found');
        }

        res.status(200).send('Category deleted successfully');
    });
});


app.post('/DeleteExpenseCategory', (req, res) => {
    const { categoryId } = req.body;


    if (!categoryId) {
        return res.status(400).send('Category ID is required');
    }

    const deleteQuery = 'DELETE FROM expense_categories WHERE id = ?';

    db.query(deleteQuery, [categoryId], (err, result) => {
        if (err) {
            console.error('Error deleting category:', err);
            return res.status(500).send('Internal Server Error');
        }

        if (result.affectedRows === 0) {
            return res.status(404).send('Category not found');
        }

        res.status(200).send('Category deleted successfully');
    });
});




app.post('/saveincome', async (req, res) => {
    const { userId, category_id, amount, description, date } = req.body;
    console.log('category_id', category_id);

    if (!amount) {
        return res.status(401).json({ message: 'Vui lòng điền đầy đủ tiền thu.' });
    } else if (!description) {
        return res.status(402).json({ message: 'Vui lòng điền đầy đủ mô tả.' });
    } else if (isNaN(amount) || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: 'Số tiền phải là một số hợp lệ và lớn hơn 0.' });
    }

    try {

        const categoryQuery = `
            SELECT category_name, color, icon
            FROM income_categories
            WHERE id = ?
        `;

        const categoryResult = await queryAsync(categoryQuery, [category_id]);

        if (!categoryResult || categoryResult.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy danh mục.' });
        }

        const { category_name, color, icon } = categoryResult[0];

        console.log('category_name', category_name);

        const insertQuery = `
            INSERT INTO income (user_id, category_id, category_name, category_color, category_icon, amount, description, date) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const result = await queryAsync(insertQuery, [userId, category_id, category_name, color, icon, amount, description, date]);

        res.status(201).json({
            id: result.insertId,
            user_id: userId,
            category_id: category_id,
            category_name: category_name,
            category_color: color,
            category_icon: icon,
            amount: amount,
            description: description,
            date: date
        });
    } catch (error) {
        console.error('Lỗi khi tạo mục thu nhập:', error);
        res.status(500).json({ error: 'Lỗi khi tạo mục thu nhập' });
    }
});


app.post('/Updateincome', async (req, res) => {
    const { id, category_id, amount, description, date } = req.body;

    console.log('Dữ liệu đầu vào:', req.body);

    if (!amount) {
        return res.status(401).json({ message: 'Vui lòng điền đầy đủ tiền thu.' });
    }
    if (!description) {
        return res.status(402).json({ message: 'Vui lòng điền đầy đủ mô tả.' });
    }
    if (isNaN(amount) || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: 'Số tiền phải là một số hợp lệ và lớn hơn 0.' });
    }

    try {

        const categoryQuery = `
            SELECT category_name, color, icon
            FROM income_categories
            WHERE id = ?
        `;
        const categoryResult = await queryAsync(categoryQuery, [category_id]);

        if (!categoryResult || categoryResult.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy danh mục.' });
        }

        const { category_name, color, icon } = categoryResult[0];


        const [day, month, year] = date.split('/');
        const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;


        const selectQuery = `
            SELECT * FROM income 
            WHERE id = ? 
        `;
        const selectResult = await queryAsync(selectQuery, [id]);

        if (selectResult.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy bản ghi phù hợp để cập nhật.' });
        }


        const updateQuery = `
            UPDATE income 
            SET amount = ?, description = ?, category_id = ?, date = ?
            WHERE id = ? 
        `;

        const result = await queryAsync(updateQuery, [
            amount,
            description,
            category_id,
            formattedDate,
            id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy khoản thu nhập để cập nhật.' });
        }


        res.status(200).json({
            category_id,
            category_name,
            category_color: color,
            category_icon: icon,
            amount,
            description,
            date: formattedDate
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật mục thu nhập:', error);
        res.status(500).json({ error: 'Lỗi khi cập nhật mục thu nhập' });
    }
});


app.post('/Updateexpense', async (req, res) => {
    const { id, category_id, amount, description, date } = req.body;

    console.log('Dữ liệu đầu vào:', req.body);

    if (!amount) {
        return res.status(401).json({ message: 'Vui lòng điền đầy đủ tiền thu.' });
    }
    if (!description) {
        return res.status(402).json({ message: 'Vui lòng điền đầy đủ mô tả.' });
    }
    if (isNaN(amount) || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: 'Số tiền phải là một số hợp lệ và lớn hơn 0.' });
    }

    try {

        const categoryQuery = `
            SELECT category_name, color, icon
            FROM expense_categories
            WHERE id = ?
        `;
        const categoryResult = await queryAsync(categoryQuery, [category_id]);

        if (!categoryResult || categoryResult.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy danh mục.' });
        }

        const { category_name, color, icon } = categoryResult[0];


        const [day, month, year] = date.split('/');
        const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;


        console.log('id', id);
        console.log('formattedDate', formattedDate);



        const selectQuery = `
            SELECT * FROM expense 
            WHERE id = ? 
        `;
        const selectResult = await queryAsync(selectQuery, [id]);

        if (selectResult.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy bản ghi phù hợp để cập nhật.' });
        }

        const updateQuery = `
            UPDATE expense 
            SET amount = ?, description = ?, category_id = ?, date = ?
            WHERE id = ? 
        `;

        const result = await queryAsync(updateQuery, [
            amount,
            description,
            category_id,
            formattedDate,
            id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy khoản thu nhập để cập nhật.' });
        }

        res.status(200).json({
            category_id,
            category_name,
            category_color: color,
            category_icon: icon,
            amount,
            description,
            date: formattedDate
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật mục thu nhập:', error);
        res.status(500).json({ error: 'Lỗi khi cập nhật mục thu nhập' });
    }
});




app.post('/saveexpense', async (req, res) => {
    const { userId, category_id, amount, description, date } = req.body;

    if (!amount) {
        return res.status(401).json({ message: 'Vui lòng điền đầy đủ tiền thu.' });
    } else if (!description) {
        return res.status(402).json({ message: 'Vui lòng điền đầy đủ mô tả.' });
    } else if (isNaN(amount) || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: 'Số tiền phải là một số hợp lệ và lớn hơn 0.' });
    }

    try {
        const categoryQuery = `
            SELECT category_name, color, icon
            FROM expense_categories
            WHERE id = ?
        `;
        const categoryResult = await queryAsync(categoryQuery, [category_id]);

        if (!categoryResult || categoryResult.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy danh mục.' });
        }

        const { category_name, color, icon } = categoryResult[0];

        console.log('category_name', category_name);

        const insertQuery = `
            INSERT INTO expense (user_id, category_id, category_name, category_color, category_icon, amount, description, date) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const result = await queryAsync(insertQuery, [userId, category_id, category_name, color, icon, amount, description, date]);

        res.status(201).json({
            id: result.insertId,
            user_id: userId,
            category_id: category_id,
            category_name: category_name,
            category_color: color,
            category_icon: icon,
            amount: amount,
            description: description,
            date: date
        });
    } catch (error) {
        console.error('Lỗi khi tạo mục thu nhập:', error);
        res.status(500).json({ error: 'Lỗi khi tạo mục thu nhập' });
    }
});


app.get('/getincome/:userId', async (req, res) => {
    const { userId } = req.params;
    let { month } = req.query;


    const startDate = moment(month).startOf('month').format('YYYY-MM-DD');
    const endDate = moment(month).endOf('month').format('YYYY-MM-DD');

    try {
        const selectQuery = `
        SELECT * 
        FROM income 
        WHERE user_id = ? 
        AND date BETWEEN ? AND ?`;

        const results = await queryAsync(selectQuery, [userId, startDate, endDate]);

        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching expense data:', error);
        res.status(500).json({ error: 'Error fetching expense data' });
    }
});

app.get('/getincomeday/:userId', async (req, res) => {
    const { userId } = req.params;
    let { date } = req.query;
    try {
        const selectQuery = `
        SELECT * 
        FROM income 
        WHERE user_id = ? 
        AND date = ?`;

        const results = await queryAsync(selectQuery, [userId, date]);

        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching expense data:', error);
        res.status(500).json({ error: 'Error fetching expense data' });
    }
});

app.get('/getexpenseday/:userId', async (req, res) => {
    const { userId } = req.params;
    let { date } = req.query;

    console.log('date', date);
    console.log('userId', userId);
    try {
        const selectQuery = `
        SELECT * 
        FROM expense 
        WHERE user_id = ? 
        AND date = ?`;

        const results = await queryAsync(selectQuery, [userId, date]);
        console.log('results la', results);

        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching expense data:', error);
        res.status(500).json({ error: 'Error fetching expense data' });
    }
});

app.get('/getincomeyear/:userId', async (req, res) => {
    const { userId } = req.params;
    const { year } = req.query;


    try {
        const selectQuery = `
        SELECT * 
        FROM income 
        WHERE user_id = ? 
        AND YEAR(date) = ?`;

        const results = await queryAsync(selectQuery, [userId, year]);

        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching income data:', error);
        res.status(500).json({ error: 'Error fetching income data' });
    }
});


app.get('/getexpenseyear/:userId', async (req, res) => {
    const { userId } = req.params;
    const { year } = req.query

    try {
        const selectQuery = `
        SELECT * 
        FROM expense 
        WHERE user_id = ? 
        AND YEAR(date) = ?`;

        const results = await queryAsync(selectQuery, [userId, year]);

        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching income data:', error);
        res.status(500).json({ error: 'Error fetching income data' });
    }
});




app.get('/getexpense/:userId', async (req, res) => {
    const { userId } = req.params;
    let { month } = req.query;
    const startDate = moment(month).startOf('month').format('YYYY-MM-DD');
    const endDate = moment(month).endOf('month').format('YYYY-MM-DD');

    try {
        const selectQuery = `
        SELECT * 
        FROM expense 
        WHERE user_id = ? 
        AND date BETWEEN ? AND ?`;

        const results = await queryAsync(selectQuery, [userId, startDate, endDate]);


        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching expense data:', error);
        res.status(500).json({ error: 'Error fetching expense data' });
    }
});




// Thêm endpoint đồng bộ hóa danh mục thu nhập
// app.post('/SyncCategories', async (req, res) => {
//     const { userId, categories } = req.body;

//     try {

//         if (!userId || !categories || !Array.isArray(categories)) {
//             return res.status(400).json({ message: 'Dữ liệu đồng bộ hóa không hợp lệ' });
//         }


//         await queryAsync('DELETE FROM income_categories WHERE user_id = ?', [userId]);


//         const insertQuery = `
//             INSERT INTO income_categories (user_id, category_name, color, icon, create_at) 
//             VALUES (?, ?, ?, ?, ?)
//         `;

//         const insertValues = categories.map(category => [
//             userId,
//             category.name,
//             category.color,
//             category.icon,
//             new Date().toISOString().slice(0, 19).replace('T', ' ')
//         ]);


//         await Promise.all(insertValues.map(values => queryAsync(insertQuery, values)));

//         res.status(200).json({ message: 'Đồng bộ hóa danh mục thành công' });
//     } catch (error) {
//         console.error('Lỗi khi đồng bộ hóa dữ liệu với server:', error);
//         res.status(500).json({ message: 'Đồng bộ hóa dữ liệu thất bại' });
//     }
// });





// Hàm thực thi truy vấn bất đồng bộ với Promise
function queryAsync(sql, values) {
    return new Promise((resolve, reject) => {
        db.query(sql, values, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}




// Khởi động server
const port = 3000;
app.listen(port, () => {
    console.log(`Server đang lắng nghe trên cổng ${port}`);
});
