const User = require('../models/user');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs/promises');

exports.getAllUsersDashboard = async (req, res) => {
  try {
    const users = await User.getAllUsers();
    const totalUsers = users.length;
    res.render('admin/dashboard', { 
      layout: 'admin/layout',
      users,
      totalUsers
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

exports.getAllUsersUsers = async (req, res) => {
  try {
    const users = await User.getAllUsers();
    res.render('admin/users', { 
      layout: 'admin/layout',
      users 
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

exports.getAllUsersReport = async (req, res) => {
  try {
    const users = await User.getAllUsers();
    res.render('admin/report', { 
      layout: 'admin/layout',
      users 
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

exports.createUser = async (req, res) => {
  try {
    const { username, name, password, role } = req.body;

    if(!username | !name | !password | !role ) {
      return res.status(400).json({
        message: 'All fields are required'
      });
    }

    const newUser = await User.create( username, name, password, role );

    if (req.xhr || req.headers.accept.indexOf('json') > -1 ) {
      req.json({
        success: true,
        user: newUser
      });
    } else {
      res.redirect('/admin/users');
    }

  } catch (error) {
    console.error(error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
}


exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, name, password, role } = req.body;

    if (!username || !name || !role) {
      return res.status(400).json({
        message: 'Username, name and role are required'
      });
    }

    const updateData = {
      username: username.trim(),
      name: name.trim(),
      role: role.trim()
    };
    
    if (password && password.trim() !== '') {
      updateData.password = password.trim();
    }

    console.log('Update Data:', updateData);

    await User.update(id, updateData);
    
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      res.json({
        success: true,
        message: 'User updated successfully'
      });
    } else {  
      res.redirect('/admin/users');
    }

  } catch (error) {
    console.error(error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
}

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.delete(id);
    
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } else {
      res.redirect('/admin/users');
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
}

exports.searchUser = async (req, res) => {
  try {
    const { search } = req.query;

    if (!search) {
      return res.redirect('/admin/users');
    }

    const users = await User.search(search);

    res.render('admin/users', {
      layout: 'admin/layout',
      users,
      searchTerm: search,
      notFound: users.length === 0
    })
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');  
  }
}

exports.downloadLaporan = async (req, res) => {
  try {
    const users = await User.getAllUsers();
    const currentDate = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const pdfDoc = await PDFDocument.create();
    const pages = [];
    let currentPage = pdfDoc.addPage([595.28, 841.89]);
    pages.push(currentPage);
    
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const primaryColor = rgb(0.05, 0.2, 0.5);
    const secondaryColor = rgb(0.7, 0.7, 0.7);
    const textColor = rgb(0.2, 0.2, 0.2);

    const drawHeader = (page, pageNumber) => {
      const { width, height } = page.getSize();
      const headerHeight = height - 50;

      page.drawText('PT. TASPEN', {
        x: 50,
        y: headerHeight,
        size: 16,
        font: boldFont,
        color: primaryColor,
      });

      page.drawText('Alamat: Jl. Dr. Wahidin Sudirohusodo No.12, Sukapura, Kec. Kejaksan, Kota Cirebon, Jawa Barat 45122', {
        x: 50,
        y: headerHeight - 20,
        size: 10,
        font,
        color: textColor,
      });

      page.drawLine({
        start: { x: 50, y: headerHeight - 40 },
        end: { x: width - 50, y: headerHeight - 40 },
        thickness: 1,
        color: secondaryColor,
      });

      if (pageNumber === 1) {
        page.drawText('LAPORAN DATA PENGGUNA', {
          x: 50,
          y: headerHeight - 80,
          size: 20,
          font: boldFont,
          color: primaryColor,
        });

        page.drawText(`Tanggal: ${currentDate}`, {
          x: 50,
          y: headerHeight - 100,
          size: 10,
          font,
          color: textColor,
        });

        return headerHeight - 140;
      }
      
      return headerHeight - 60;
    };

    const drawFooter = (page, pageNumber, totalPages) => {
      const { width } = page.getSize();
      const footerHeight = 50;

      page.drawLine({
        start: { x: 50, y: footerHeight + 20 },
        end: { x: width - 50, y: footerHeight + 20 },
        thickness: 1,
        color: secondaryColor,
      });

      page.drawText('© 2024 Nama Instansi - All Rights Reserved', {
        x: 50,
        y: footerHeight,
        size: 8,
        font,
        color: secondaryColor,
      });

      page.drawText(`Halaman ${pageNumber} dari ${totalPages}`, {
        x: width - 120,
        y: footerHeight,
        size: 8,
        font,
        color: secondaryColor,
      });
    };

    let y = drawHeader(currentPage, 1);
    const { width, height } = currentPage.getSize();

    const tableHeaders = ['No', 'Username', 'Nama Lengkap', 'Role'];
    const columnWidths = [40, 150, 200, 100];

    const drawTableHeader = (page, yPosition) => {
      let startX = 50;

      page.drawRectangle({
        x: startX,
        y: yPosition - 15,
        width: width - 100,
        height: 25,
        color: primaryColor,
      });

      tableHeaders.forEach((header, index) => {
        page.drawText(header, {
          x: startX + 10,
          y: yPosition - 5,
          size: 11,
          font: boldFont,
          color: rgb(1, 1, 1),
        });
        startX += columnWidths[index];
      });

      return yPosition - 35;
    };

    y = drawTableHeader(currentPage, y);

    users.forEach((user, index) => {
      if (y < 100) {
        currentPage = pdfDoc.addPage([595.28, 841.89]);
        pages.push(currentPage);
        y = drawHeader(currentPage, pages.length);
        y = drawTableHeader(currentPage, y);
      }

      let startX = 50;
      const rowData = [
        `${index + 1}`,
        user.username || '',
        user.name || '',
        user.role || '',
      ];

      if (index % 2 === 0) {
        currentPage.drawRectangle({
          x: 50,
          y: y - 15,
          width: width - 100,
          height: 25,
          color: rgb(0.95, 0.95, 0.95),
        });
      }

      rowData.forEach((data, colIndex) => {
        currentPage.drawText(String(data), {
          x: startX + 10,
          y: y - 5,
          size: 10,
          font,
          color: textColor,
        });
        startX += columnWidths[colIndex];
      });
      y -= 25;
    });

    pages.forEach((page, index) => {
      drawFooter(page, index + 1, pages.length);
    });

    const pdfBytes = await pdfDoc.save();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=Laporan-Data-Pengguna.pdf');
    res.setHeader('Content-Length', pdfBytes.length);
    res.send(Buffer.from(pdfBytes));

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF report',
      error: error.message
    });
  }
};