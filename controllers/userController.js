const Dosir = require('../models/dosir');
const User = require('../models/user');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs/promises');
const path = require('path');
const  bcrypt = require('bcrypt');

exports.getAllDosirsDashboard = async (req, res) => {
  try {
    const dosirs = await Dosir.getAllDosirs();
    const totalDosirs = dosirs.length;

    res.render('user/dashboard', { 
      layout: 'user/layout',
      dosirs,
      totalDosirs
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

exports.getAllDosirsDosirs = async (req, res) => {
  try {
    const dosirs = await Dosir.getAllDosirs();
    res.render('user/dosirs', { 
      layout: 'user/layout',
      dosirs
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

exports.getAllDosirsReport = async (req, res) => {
  try {
    const dosirs = await Dosir.getAllDosirs();
    res.render('user/report', { 
      layout: 'user/layout',
      dosirs
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

exports.createDosir = async (req, res) => {
  try {
    const { notas, no_dosir, name, shelf } = req.body;

    if(!notas || !no_dosir || !name || !shelf) {
      return res.status(400).json({
        message: 'All fields are required'
      });
    }

    const newDosir = await Dosir.create(notas, no_dosir, name, shelf);

    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      res.json({
        success: true,
        dosir: newDosir
      });
    } else {
      res.redirect('/user/dosirs');
    }

  } catch (error) {
    console.error(error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
}

exports.updateDosir = async (req, res) => {
  try {
    const { id } = req.params;
    const { notas, no_dosir, name, shelf } = req.body;

    if (!notas || !no_dosir || !name || !shelf) {
      return res.status(400).json({
        message: 'Notas, no dosir, name and shelf are required'
      });
    }

    const updateData = {
      notas: notas.trim(),
      no_dosir: no_dosir.trim(), 
      name: name.trim(),
      shelf: shelf.trim()
    };

    await Dosir.update(id, updateData);
    
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      res.json({
        success: true,
        message: 'Dosir updated successfully'
      });
    } else {
      res.redirect('/user/dosirs');
    }

  } catch (error) {
    console.error(error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
}

exports.deleteDosir = async (req, res) => {
  try {
    const { id } = req.params;
    await Dosir.delete(id);
    
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      res.json({
        success: true,
        message: 'Dosir deleted successfully'
      });
    } else {
      res.redirect('/user/dosirs');
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
}

exports.searchDosir = async (req, res) => {
  try {
    const { search } = req.query;

    if (!search) {
      return res.redirect('/user/dosirs');
    }

    const dosirs = await Dosir.search(search);

    res.render('user/dosirs', {
      layout: 'user/layout',
      dosirs,
      searchTerm: search,
      notFound: dosirs.length === 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');  
  }
};

exports.downloadLaporan = async (req, res) => {
  try {
    const dosirs = await Dosir.getAllDosirs();
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
        page.drawText('LAPORAN DATA DOSIR', {
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
    
    const tableWidth = width - 100;
    const tableHeaders = ['No', 'Notas', 'No Dosir', 'Nama', 'Rak'];
    const columnWidths = [40, 115, 115, 160, 115];

    const drawTableHeader = (page, yPosition) => {
      let startX = 50;

      page.drawRectangle({
        x: startX,
        y: yPosition - 15,
        width: tableWidth,
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

    dosirs.forEach((dosir, index) => {
      if (y < 100) {
        currentPage = pdfDoc.addPage([595.28, 841.89]);
        pages.push(currentPage);
        y = drawHeader(currentPage, pages.length);
        y = drawTableHeader(currentPage, y);
      }

      let startX = 50;
      const rowData = [
        `${index + 1}`,
        dosir.notas || '',
        dosir.no_dosir || '',
        dosir.name || '',
        dosir.shelf || '',
      ];

      if (index % 2 === 0) {
        currentPage.drawRectangle({
          x: 50,
          y: y - 15,
          width: tableWidth,
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
    res.setHeader('Content-Disposition', 'attachment; filename=Laporan-Data-Dosir.pdf');
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

exports.getProfile = async (req, res) => {
  try {
    const [user] = await User.getUserById(req.session.user.id);
    res.render('user/profile', {
      layout: 'user/layout',
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const id = req.session.user.id;
    const { name } = req.body;

    const updateData = { name };

    if (req.file) {
      updateData.profile_image = req.file.filename;

      const [currentUser] = await User.getUserById(id);
      const oldImg = currentUser.profile_image;
      if (oldImg && oldImg !== 'default.jpg') {
        const oldImgPath = path.join(__dirname, '../public/images/profiles/', oldImg);
        try {
          await fs.unlink(oldImgPath);
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }
    }

    await User.updateProfile(id, updateData);

    res.redirect('/user/profile');
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.session.user.id;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Semua field harus diisi' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Password baru dan konfirmasi password tidak cocok' });
    }

    const [user] = await User.getUserById(userId);
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);

    if (!isValidPassword) {
      return res.status(400).json({ message: 'Password lama tidak valid' });
    }

    await User.updatePassword(userId, newPassword);

    res.redirect('/user/profile');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}