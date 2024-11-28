// دالة للتحقق من صحة رقم الهاتف
function validatePhone(phone) {
    if (!/^[0-9]+$/.test(phone)) {
      return false;
    }
    if (phone.length < 10 || phone.length > 15) {
      return false;
    }
    return true;
  }
  
  // دالة لحساب مجموع الرصيد
  function calculateBalance(customerPhone) {
    let balance = 0;
    const keys = Object.keys(localStorage);
    const transactionKeys = keys.filter(key =>
      key.startsWith("transaction-") &&
      JSON.parse(localStorage.getItem(key)).customerPhone === customerPhone
    );
    transactionKeys.forEach(transactionKey => {
      let transaction = JSON.parse(localStorage.getItem(transactionKey));
      if (transaction.type === "فاتورة") {
        balance += parseFloat(transaction.amount);
      } else if (transaction.type === "دفع") {
        balance -= parseFloat(transaction.amount);
      }
    });
    return balance;
  }
  
  // -------------------
  // صفحة إضافة/تعديل زبون
  // -------------------
  document.addEventListener('DOMContentLoaded', (event) => {
    // تحديد نموذج إدخال البيانات
    const customerForm = document.getElementById("customerForm");
  
    // جلب رقم هاتف العميل من معلمات URL
    const urlParamsCustomer = new URLSearchParams(window.location.search);
    const customerPhone = urlParamsCustomer.get('phone');
  
    // إذا تم تمرير رقم هاتف، نقوم بجلب بيانات العميل من localStorage
    if (customerPhone) {
      const customerData = localStorage.getItem("customer-" + customerPhone);
      if (customerData) {
        const customer = JSON.parse(customerData);
  
        // تعبئة النموذج ببيانات العميل
        document.getElementById("name").value = customer.name;
        document.getElementById("phone").value = customer.phone;
  
        // جعل حقل "رقم الهاتف" للقراءة فقط في حالة التعديل
        document.getElementById("phone").readOnly = true;
      }
    }
  
    // إضافة حدث عند إرسال النموذج
    customerForm.addEventListener("submit", (event) => {
      event.preventDefault();
  
      // جمع بيانات الزبون من النموذج
      let customer = {
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value
      };
  
      // التحقق من صحة رقم الهاتف
      if (!validatePhone(customer.phone)) {
        alert("رقم الهاتف غير صحيح.");
        return;
      }
  
      // تحويل بيانات الزبون إلى سلسلة نصية وحفظها في localStorage
      let customerData = JSON.stringify(customer);
      localStorage.setItem("customer-" + customer.phone, customerData);
  
      // مسح النموذج وعرض رسالة تأكيد
      customerForm.reset();
      alert("تم حفظ بيانات الزبون بنجاح!");
      // إعادة توجيه المستخدم إلى صفحة "متابعة الجباية"
      window.location.href = "track_collection.html";
    });
  });
  
  // -------------------
  // صفحة إضافة/تعديل فاتورة/دفعة
  // -------------------
  document.addEventListener('DOMContentLoaded', (event) => {
    // تحديد نموذج إدخال البيانات
    const transactionForm = document.getElementById("transactionForm");
    // تحديد القائمة المنسدلة للعملاء
    const customerSelect = document.getElementById("customer");
  
    // جلب جميع المفاتيح من localStorage
    const keys = Object.keys(localStorage);
  
    // تصفية المفاتيح للحصول على مفاتيح العملاء فقط
    const customerKeys = keys.filter(key => key.startsWith("customer-"));
  
    // إضافة خيارات إلى القائمة المنسدلة
    customerKeys.forEach(key => {
      let customerData = localStorage.getItem(key);
      let customer = JSON.parse(customerData);
      let option = document.createElement("option");
      option.value = customer.phone;
      option.text = customer.name;
      customerSelect.add(option);
    });
  
    // جلب مفتاح الفاتورة/الدفعة من معلمات URL
    const urlParamsTransaction = new URLSearchParams(window.location.search);
    const transactionKey = urlParamsTransaction.get('key');
    const customerPhoneFromTable = urlParamsTransaction.get('phone'); 
  
    // إذا تم تمرير مفتاح، نقوم بجلب بيانات الفاتورة/الدفعة من localStorage
    if (transactionKey) {
      const transactionData = localStorage.getItem(transactionKey);
      if (transactionData) {
        const transaction = JSON.parse(transactionData);
  
        // تعبئة النموذج ببيانات الفاتورة/الدفعة
        document.getElementById("customer").value = transaction.customerPhone;
        document.getElementById("type").value = transaction.type;
        document.getElementById("amount").value = transaction.amount;
      }
    } else if (customerPhoneFromTable) {
      // تحديد العميل في القائمة المنسدلة بناءً على رقم الهاتف
      document.getElementById("customer").value = customerPhoneFromTable;
    }
  
    // إضافة حدث عند إرسال النموذج
    transactionForm.addEventListener("submit", (event) => {
      event.preventDefault();
  
      // جمع بيانات الفاتورة/الدفع من النموذج
      let transaction = {
        customerPhone: document.getElementById("customer").value,
        type: document.getElementById("type").value,
        amount: document.getElementById("amount").value,
        invoice: "" // تهيئة قيمة صورة الفاتورة
      };
  
      // معالجة الملف المرفق
      const invoiceFile = document.getElementById("invoice").files[0];
      if (invoiceFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
          transaction.invoice = e.target.result;
  
          // حفظ بيانات الفاتورة/الدفع (مع مراعاة التعديل)
          if (transactionKey) {
            // تعديل فاتورة/دفعة موجودة
            localStorage.setItem(transactionKey, JSON.stringify(transaction));
            alert("تم تعديل الفاتورة/الدفعة بنجاح!");
          } else {
            // إضافة فاتورة/دفعة جديدة
            let newTransactionKey = "transaction-" + Date.now();
            localStorage.setItem(newTransactionKey, JSON.stringify(transaction));
            alert("تم إضافة الفاتورة/الدفع بنجاح!");
          }
  
          // مسح النموذج
          transactionForm.reset();
        }
        reader.readAsDataURL(invoiceFile);
      } else {
        // حفظ بيانات الفاتورة/الدفع (مع مراعاة التعديل)
        if (transactionKey) {
          // تعديل فاتورة/دفعة موجودة
          localStorage.setItem(transactionKey, JSON.stringify(transaction));
          alert("تم تعديل الفاتورة/الدفعة بنجاح!");
        } else {
          // إضافة فاتورة/دفعة جديدة
          let newTransactionKey = "transaction-" + Date.now();
          localStorage.setItem(newTransactionKey, JSON.stringify(transaction));
          alert("تم إضافة الفاتورة/الدفع بنجاح!");
        }
  
        // مسح النموذج
        transactionForm.reset();
      }
    });
  });
  
  // -------------------
  // صفحة متابعة الجباية
  // -------------------
  document.addEventListener('DOMContentLoaded', (event) => {
    // تحديد حقل إدخال نص البحث
    const searchInput = document.getElementById("searchInput");
  
    // تحديد جدول "متابعة الجباية"
    const tableBody = document.querySelector("#customerTable tbody");
  
    // إضافة حدث عند تغيير قيمة حقل البحث
    searchInput.addEventListener("input", () => {
      const searchTerm = searchInput.value.toLowerCase();
  
      // جلب جميع صفوف الجدول
      const rows = tableBody.querySelectorAll("tr");
  
      // إخفاء/إظهار الصفوف بناءً على نص البحث
      rows.forEach(row => {
        const name = row.cells[0].textContent.toLowerCase(); // اسم الزبون في العمود الأول
        if (name.includes(searchTerm)) {
          row.style.display = ""; // إظهار الصف
        } else {
          row.style.display = "none"; // إخفاء الصف
        }
      });
    });
  
    // جلب جميع المفاتيح من localStorage
    const keys = Object.keys(localStorage);
  
    // تصفية المفاتيح للحصول على مفاتيح العملاء فقط
    const customerKeys = keys.filter(key => key.startsWith("customer-"));
  
    // إنشاء صفوف في الجدول لعرض بيانات العملاء
    customerKeys.forEach(customerKey => {
      let customerData = localStorage.getItem(customerKey);
      let customer = JSON.parse(customerData);
      let balance = calculateBalance(customer.phone);
  
      // إنشاء صف جديد في الجدول
      const row = tableBody.insertRow(); 
  
      // إضافة باقي بيانات العميل إلى الصف
      row.innerHTML = `
        <td>${customer.name}</td>
        <td>${balance}</td> 
      `;
  
      // إضافة رابط "التفاصيل"
      const detailsLink = document.createElement("a");
      detailsLink.href = `customer_details.html?phone=${customer.phone}`;
      detailsLink.textContent = "عرض التفاصيل";
  
      // إضافة الرابط إلى خلية جديدة في الصف
      const detailsCell = row.insertCell();
      detailsCell.appendChild(detailsLink);
  
      // إضافة زر "إضافة فاتورة/دفعة"
      const addTransactionButton = document.createElement("button");
      addTransactionButton.textContent = "إضافة فاتورة/دفعة";
      addTransactionButton.addEventListener("click", () => {
        // توجيه المستخدم إلى صفحة "إضافة فاتورة/دفعة" مع تمرير رقم الهاتف
        window.location.href = `add_transaction.html?phone=${customer.phone}`;
      });
  
      // إضافة الزر إلى خلية جديدة في الصف
      const addTransactionCell = row.insertCell();
      addTransactionCell.appendChild(addTransactionButton);
  
      // إضافة زر "حذف"
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "حذف";
      deleteButton.addEventListener("click", () => {
        if (confirm(`هل أنت متأكد من حذف العميل ${customer.name}؟`)) {
          // حذف العميل من localStorage
          localStorage.removeItem("customer-" + customer.phone);
  
          // حذف جميع الفواتير/الدفعات المرتبطة بهذا العميل
          const transactionKeys = keys.filter(key =>
            key.startsWith("transaction-") &&
            JSON.parse(localStorage.getItem(key)).customerPhone === customer.phone
          );
          transactionKeys.forEach(transactionKey => {
            localStorage.removeItem(transactionKey);
          });
  
          // إعادة تحميل الصفحة
          location.reload();
        }
      });
  
      // إضافة الزر إلى خلية جديدة في الصف
      const deleteCell = row.insertCell();
      deleteCell.appendChild(deleteButton);
  
      // إضافة زر "تعديل"
      const editButton = document.createElement("button");
      editButton.textContent = "تعديل";
      editButton.addEventListener("click", () => {
        // توجيه المستخدم إلى صفحة "إضافة زبون جديد" مع تمرير رقم الهاتف
        window.location.href = `add_customer.html?phone=${customer.phone}`;
      });
  
      // إضافة الزر إلى خلية جديدة في الصف
      const editCell = row.insertCell();
      editCell.appendChild(editButton);
  
      tableBody.appendChild(row);
    });
  });
  
  // -------------------
  // صفحة تفاصيل الزبون
  // -------------------
  document.addEventListener('DOMContentLoaded', (event) => {
    // جلب رقم هاتف العميل من معلمات URL
    const urlParams = new URLSearchParams(window.location.search);
    const customerPhone = urlParams.get('phone');
  
    if (customerPhone) {
      // جلب بيانات العميل من localStorage
      const customerData = localStorage.getItem("customer-" + customerPhone);
      const customer = JSON.parse(customerData);
  
      // عرض معلومات العميل
      const customerInfo = document.getElementById("customerInfo");
      customerInfo.innerHTML = `
        <h2>${customer.name}</h2>
        <p>رقم الهاتف: ${customer.phone}</p>
      `;
  
      // جلب جميع المفاتيح من localStorage
      const keys = Object.keys(localStorage);
  
      // تصفية المفاتيح للحصول على مفاتيح الفواتير/الدفعات الخاصة بهذا العميل
      const transactionKeys = keys.filter(key =>
        key.startsWith("transaction-") &&
        JSON.parse(localStorage.getItem(key)).customerPhone === customerPhone
      );
  
      // عرض الفواتير/الدفعات في الجدول
      const transactionsTable = document.getElementById("transactionsTable").getElementsByTagName('tbody')[0];
      transactionKeys.forEach(transactionKey => {
        const transactionData = localStorage.getItem(transactionKey);
        const transaction = JSON.parse(transactionData);
  
        // إنشاء صف جديد في الجدول
        const row = transactionsTable.insertRow();
        const typeCell = row.insertCell();
        const amountCell = row.insertCell();
        const attachmentCell = row.insertCell();
        const notesCell = row.insertCell();
  
        typeCell.textContent = transaction.type;
        amountCell.textContent = transaction.amount;
  
        // عرض المرفق (صورة الفاتورة)
        if (transaction.invoice) {
          const image = document.createElement('img');
          image.src = transaction.invoice;
          image.alt = "صورة الفاتورة";
          image.width = 100;
          attachmentCell.appendChild(image);
        }
  
        // جلب الملاحظات من localStorage (إذا كانت موجودة)
        const notesKey = "notes-" + customer.phone + "-" + transactionKey;
        const existingNotes = localStorage.getItem(notesKey);
        if (existingNotes) {
          notesCell.textContent = existingNotes;
        }
      });
    }
  });
  
  // -------------------
  // صفحة ملاحظات الجباية
  // -------------------
  document.addEventListener('DOMContentLoaded', (event) => {
    // جلب رقم هاتف العميل من معلمات URL
    const urlParamsNotes = new URLSearchParams(window.location.search);
    const customerPhoneNotes = urlParamsNotes.get('id');
  
    if (customerPhoneNotes) {
      // جلب بيانات العميل من localStorage
      const customerData = localStorage.getItem("customer-" + customerPhoneNotes);
      const customer = JSON.parse(customerData);
  
      // عرض معلومات العميل
      const customerInfo = document.getElementById("customerInfo");
      customerInfo.innerHTML = `
        <h2>${customer.name}</h2>
        <p>رقم الهاتف: ${customer.phone}</p>
      `;
  
      // جلب ملاحظات الجباية من localStorage (إذا كانت موجودة)
      const notesTextarea = document.getElementById("notes");
      const notesKey = "notes-" + customerPhoneNotes;
      const existingNotes = localStorage.getItem(notesKey);
      if (existingNotes) {
        notesTextarea.value = existingNotes;
      }
  
      // حفظ الملاحظات عند النقر على زر "حفظ الملاحظات"
      const saveNotesButton = document.getElementById("saveNotes");
      saveNotesButton.addEventListener("click", () => {
        const notes = notesTextarea.value;
        localStorage.setItem(notesKey, notes);
        alert("تم حفظ الملاحظات بنجاح!");
      });
  
      // تصفية المفاتيح للحصول على مفاتيح الفواتير/الدفعات الخاصة بهذا العميل
      const transactionKeys = keys.filter(key =>
        key.startsWith("transaction-") &&
        JSON.parse(localStorage.getItem(key)).customerPhone === customerPhoneNotes
      );
  
      // عرض الفواتير/الدفعات في الجدول
      const transactionsTable = document.getElementById("transactionsTable").getElementsByTagName('tbody')[0];
      transactionKeys.forEach(transactionKey => {
        const transactionData = localStorage.getItem(transactionKey);
        const transaction = JSON.parse(transactionData);
  
        // إنشاء صف جديد في الجدول
        const row = transactionsTable.insertRow();
        const typeCell = row.insertCell();
        const amountCell = row.insertCell();
        const attachmentCell = row.insertCell();
        const notesCell = row.insertCell(); 
  
        typeCell.textContent = transaction.type;
        amountCell.textContent = transaction.amount;
  
        // عرض المرفق (صورة الفاتورة)
        if (transaction.invoice) {
          const image = document.createElement('img');
          image.src = transaction.invoice;
          image.alt = "صورة الفاتورة";
          image.width = 100;
          attachmentCell.appendChild(image);
        }
  
        // جلب الملاحظات من localStorage (إذا كانت موجودة)
        const notesKey = "notes-" + customer.phone + "-" + transactionKey;
        const existingNotes = localStorage.getItem(notesKey);
        if (existingNotes) {
          notesCell.textContent = existingNotes;
        }
      });
    }
  });