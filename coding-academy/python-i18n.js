/* English/Urdu learner coaching for executable Python. Keep code and tests language-neutral. */
window.LAMA_PYTHON_I18N = {
  "missions": {
    "pyx-greetings": {
      "topic": "فنکشن",
      "title": "نئے طالب علم کو خوش آمدید کہیں",
      "purpose": "ایپس ہر صارف کو اس کے نام کے مطابق خوش آمدید کہتی ہیں۔",
      "concept": "def سے ایک فنکشن بنتا ہے۔ پیرامیٹر کی مدد سے مختلف نام استعمال ہو سکتے ہیں، اور return جواب واپس کرتا ہے۔",
      "task": "greet(name) بنائیں جو دیے گئے نام کے ساتھ 'Hello, ' اور آخر میں ! ملا کر واپس کرے۔",
      "question": "فنکشن میں پیرامیٹر استعمال کرنے کا فائدہ کیا ہے؟",
      "options": [
        "فنکشن مختلف ان پٹ لے سکتا ہے",
        "فائلیں خود بخود محفوظ ہوتی ہیں",
        "صفحے کا رنگ بدل جاتا ہے"
      ]
    },
    "pyx-fees": {
      "topic": "حساب",
      "title": "اسکول کی فیس کا حساب",
      "purpose": "فیس کا سافٹ ویئر مختلف رقموں اور مہینوں کے لیے درست کل رقم نکالتا ہے۔",
      "concept": "ضرب کے لیے * استعمال ہوتا ہے۔ فنکشن کے اندر print کے بجائے return سے عدد واپس کریں۔",
      "task": "total_fee(monthly, months) لکھیں جو ماہانہ فیس کو مہینوں کی تعداد سے ضرب دے کر واپس کرے۔",
      "question": "total_fee(500, 3) کا درست جواب کیا ہوگا؟",
      "options": [
        "503",
        "1500",
        "500"
      ]
    },
    "pyx-grades": {
      "topic": "شرائط",
      "title": "کامیاب یا ناکام نتیجہ",
      "purpose": "رزلٹ سسٹم ہر طالب علم کے لیے ایک ہی پاسنگ معیار استعمال کرتا ہے۔",
      "concept": "if سے شرط لگاتے ہیں۔ >= کا مطلب برابر یا زیادہ ہے۔",
      "task": "has_passed(score) لکھیں: 50 یا زیادہ پر True اور کم نمبر پر False واپس کرے۔",
      "question": ">= کا کیا مطلب ہے؟",
      "options": [
        "صرف زیادہ",
        "کم یا برابر",
        "زیادہ یا برابر"
      ]
    },
    "pyx-attendance": {
      "topic": "فی صد",
      "title": "حاضری کا فی صد",
      "purpose": "حاضری ڈیش بورڈ میں خالی کلاس کے لیے صفر سے تقسیم کرنے کی غلطی سے بچنا ضروری ہے۔",
      "concept": "کل طلبہ صفر ہوں تو پہلے if سے صفر واپس کریں، پھر round سے فی صد کو مکمل عدد میں بدلیں۔",
      "task": "attendance_rate(present, total) بنائیں۔ total صفر ہو تو 0؛ ورنہ round(present / total * 100) واپس کریں۔",
      "question": "پہلے total == 0 کیوں چیک کرتے ہیں؟",
      "options": [
        "صفر سے تقسیم کی غلطی سے بچنے کے لیے",
        "نئی فہرست بنانے کے لیے",
        "نمبر الٹنے کے لیے"
      ]
    },
    "pyx-stock": {
      "topic": "فہرستیں",
      "title": "کم اسٹاک کی اطلاع",
      "purpose": "اسٹور یا اسکول دفتر میں کم ہونے والی اشیا کی بروقت نشاندہی ضروری ہے۔",
      "concept": "List comprehension کی مدد سے ریکارڈ فلٹر کر کے ناموں کی فہرست حاصل ہو سکتی ہے۔",
      "task": "low_stock(items) بنائیں، جو quantity 10 سے کم ہونے والی اشیا کے نام اصل ترتیب میں واپس کرے۔ ہر item میں name اور quantity موجود ہیں۔",
      "question": "10 سے کم کی شرط میں کون سی تعداد شامل ہوگی؟",
      "options": [
        "10",
        "9",
        "15"
      ]
    },
    "pyx-average": {
      "topic": "ڈیٹا کا حساب",
      "title": "نمبرز کا اوسط",
      "purpose": "اساتذہ امتحانی نمبروں کا خلاصہ خودکار طور پر بنا سکتے ہیں۔",
      "concept": "sum سے مجموعہ اور len سے تعداد ملتی ہے۔ تقسیم سے پہلے خالی فہرست چیک کریں۔",
      "task": "average_marks(scores) بنائیں جو نمبروں کا اوسط واپس کرے، مگر فہرست خالی ہو تو 0 دے۔",
      "question": "فہرست خالی ہونے پر کیا کرنا چاہیے؟",
      "options": [
        "صفر سے تقسیم کریں",
        "بغیر تقسیم صفر واپس کریں",
        "فہرست حذف کر دیں"
      ]
    },
    "pyx-clean": {
      "topic": "متن",
      "title": "ریکارڈ نمبر صاف کریں",
      "purpose": "حقیقی ریکارڈ میں اضافی اسپیس یا ہائفن کی وجہ سے تلاش میں مسئلہ ہو سکتا ہے۔",
      "concept": "replace اور strip جیسے String methods سے متن کی غیر ضروری علامات ختم ہوتی ہیں۔",
      "task": "clean_reference(raw) لکھیں جو اسپیس اور ہائفن ختم کر دے، مگر بڑے اور چھوٹے حروف کی شکل برقرار رکھے۔",
      "question": "replace('-', '') کیا کرتا ہے؟",
      "options": [
        "ہائفن ہٹاتا ہے",
        "ہائفن شامل کرتا ہے",
        "متن کو نمبر بناتا ہے"
      ]
    },
    "pyx-absent": {
      "topic": "ڈکشنری",
      "title": "غیر حاضر طلبہ کی گنتی",
      "purpose": "حاضری کی رپورٹ میں درست اور محفوظ ریکارڈ پر مبنی گنتی چاہیے۔",
      "concept": "ڈکشنری کی فہرست میں ہر ریکارڈ کے present فیلڈ سے حاضر یا غیر حاضر کی شناخت کریں۔",
      "task": "count_absent(records) بنائیں جو present کی قدر False ہونے والے ریکارڈ گنے۔",
      "question": "ڈکشنری میں key کس چیز کی شناخت کرتی ہے؟",
      "options": [
        "ایک بے ترتیب جگہ",
        "ریکارڈ میں نامزد قدر",
        "براؤزر کے سائز"
      ]
    },
    "pyx-grade-label": {
      "topic": "کاروباری اصول",
      "title": "گریڈ کا درجہ مقرر کریں",
      "purpose": "نتائج میں نمبروں کو واضح درجات میں تبدیل کرنا مفید ہوتا ہے۔",
      "concept": "if کی ترتیب اہم ہے۔ سب سے زیادہ گریڈ کی شرط پہلے چیک کریں۔",
      "task": "grade_band(score) لکھیں: 80 یا زیادہ پر A، 60–79 پر B، 50–59 پر C، اور 50 سے کم پر F واپس کرے۔",
      "question": "سب سے زیادہ نمبر کا درجہ پہلے کیوں چیک کرتے ہیں؟",
      "options": [
        "تاکہ زیادہ نمبر کم درجے میں نہ آ جائیں",
        "زیادہ متن پرنٹ کرنے کے لیے",
        "HTML ٹیگ بنانے کے لیے"
      ]
    },
    "pyx-report": {
      "topic": "منی پراجیکٹ",
      "title": "کامیاب طلبہ کی رپورٹ",
      "purpose": "رپورٹنگ سافٹ ویئر ریکارڈ فلٹر کر کے مناسب ترتیب میں دکھاتا ہے۔",
      "concept": "فلٹرنگ، ڈکشنری اور sorted کو ملا کر قابل مطالعہ رپورٹ بنائی جا سکتی ہے۔",
      "task": "passing_names(students) بنائیں، جو score کم از کم 50 رکھنے والے طلبہ کے نام حروف تہجی کی ترتیب میں واپس کرے۔ ہر ریکارڈ میں name اور score موجود ہیں۔",
      "question": "رپورٹ کے نام ترتیب سے رکھنے کا فائدہ کیا ہے؟",
      "options": [
        "نتائج واضح اور یکساں ترتیب میں نظر آتے ہیں",
        "کم نمبر چھپ جاتے ہیں",
        "طلبہ کے نمبر بدل جاتے ہیں"
      ]
    }
  },
  "ui": {
    "en": {
      "language": "اردو",
      "smallLabel": "Real coding practice",
      "statusIdle": "Not started",
      "statusStart": "Starting…",
      "statusLoad": "Loading Python runtime…",
      "statusRun": "Running Python tests…",
      "statusFinished": "Finished",
      "statusStop": "Stopped",
      "initOut": "Click Run Python to start.",
      "initTests": "No tests run yet.",
      "previousDone": "Mission previously completed. Re-run if you change the code.",
      "startHint": "Change the starter code, run it, and answer the concept question.",
      "busy": "First use may download a large Python runtime. A network connection is required.",
      "success": "All three Python behavior tests passed! Answer the concept question and press Check & Complete Mission.",
      "failed": "One or more Python behavior tests failed. Use the feedback and hint, then try again.",
      "errored": "Python reported an error. Read the traceback, fix your code and run it again.",
      "needRun": "Run your latest code and pass all behavior tests before completing the mission.",
      "wrongAnswer": "The concept answer is not correct yet. Review the explanation and choose again.",
      "finished": "Mission passed! Your code passed all three behavior tests and you answered the concept question correctly.",
      "run": "▶ Run Python & Tests",
      "stop": "■ Stop / Reset Runtime",
      "complete": "✓ Check & Complete Mission",
      "download": "↓ Download .py",
      "restore": "Restore starter",
      "prev": "← Previous",
      "next": "Next mission →",
      "conceptTitle": "Concept check",
      "hint": "Need a code hint?",
      "industry": "Industry connection:",
      "programOutput": "Program output",
      "testFeedback": "Test feedback",
      "codeTitle": "main.py — Python code",
      "title": "Write real Python. See real results.",
      "intro": "Ten guided challenges use a real Python interpreter running inside a browser worker. Each has three behavior tests and a concept check.",
      "stat": "Python missions completed",
      "online": "Online runtime required: Python downloads a large WebAssembly runtime on first use. Your lessons and code drafts are saved locally; execution may require internet access.",
      "notSafe": "For learner-written practice only. Do not paste passwords, API keys or private student data.",
      "greeting": "Welcome to Python Lab.",
      "offlineAlternative": "Low-data alternative: practice Python syntax without downloading the real interpreter."
    },
    "ur": {
      "language": "English",
      "smallLabel": "حقیقی کوڈنگ کی مشق",
      "statusIdle": "شروع نہیں ہوا",
      "statusStart": "شروع ہو رہا ہے…",
      "statusLoad": "پائتھن لوڈ ہو رہا ہے…",
      "statusRun": "پائتھن کے ٹیسٹ چل رہے ہیں…",
      "statusFinished": "مکمل",
      "statusStop": "روک دیا گیا",
      "initOut": "پائتھن چلائیں پر کلک کریں۔",
      "initTests": "ابھی کوئی ٹیسٹ نہیں چلا۔",
      "previousDone": "یہ مشق پہلے مکمل ہو چکی ہے۔ کوڈ بدلنے کے بعد دوبارہ چلائیں۔",
      "startHint": "ابتدائی کوڈ تبدیل کریں، چلائیں اور تصور سے متعلق سوال کا جواب دیں۔",
      "busy": "پہلی بار پائتھن کا بڑا رن ٹائم ڈاؤن لوڈ ہو سکتا ہے۔ انٹرنیٹ ضروری ہے۔",
      "success": "پائتھن کے تینوں ٹیسٹ کامیاب! اب تصور والا سوال حل کریں اور مشق مکمل کریں۔",
      "failed": "ایک یا زیادہ ٹیسٹ ناکام ہیں۔ اشارہ اور نتیجہ دیکھ کر کوڈ درست کریں۔",
      "errored": "پائتھن میں خرابی آئی ہے۔ غلطی کی تفصیل پڑھ کر کوڈ درست کریں۔",
      "needRun": "مشق مکمل کرنے سے پہلے تازہ کوڈ کے تینوں ٹیسٹ کامیاب کریں۔",
      "wrongAnswer": "تصور والے سوال کا جواب درست نہیں۔ وضاحت پڑھ کر دوبارہ انتخاب کریں۔",
      "finished": "مشق مکمل! تینوں پروگرام ٹیسٹ اور تصور والا سوال درست ہیں۔",
      "run": "▶ پائتھن چلائیں اور ٹیسٹ کریں",
      "stop": "■ روکیں / دوبارہ شروع کریں",
      "complete": "✓ مشق مکمل کریں",
      "download": "↓ .py فائل محفوظ کریں",
      "restore": "ابتدائی کوڈ واپس لائیں",
      "prev": "← پچھلی مشق",
      "next": "اگلی مشق →",
      "conceptTitle": "تصور کی جانچ",
      "hint": "کوڈ میں مدد چاہیے؟",
      "industry": "عملی استعمال:",
      "programOutput": "پروگرام کا نتیجہ",
      "testFeedback": "ٹیسٹ کا نتیجہ",
      "codeTitle": "main.py — پائتھن کوڈ",
      "title": "اصل پائتھن لکھیں اور نتیجہ دیکھیں۔",
      "intro": "دس رہنمائی والی مشقوں میں اصل Python انٹرپریٹر چلتا ہے۔ ہر مشق میں تین ٹیسٹ اور ایک تصوراتی سوال ہے۔",
      "stat": "پائتھن کی مکمل مشقیں",
      "online": "پائتھن کا رن ٹائم پہلی بار ڈاؤن لوڈ ہوگا۔ مشقیں اور آپ کا کوڈ اس ڈیوائس پر محفوظ ہوتے ہیں، مگر پائتھن چلانے کے لیے انٹرنیٹ ضروری ہو سکتا ہے۔",
      "notSafe": "یہ سیکھنے کی مشق ہے۔ پاس ورڈ، ذاتی طلبہ کا ریکارڈ یا خفیہ چابیاں یہاں استعمال نہ کریں۔",
      "greeting": "پائتھن لیب میں خوش آمدید۔",
      "offlineAlternative": "کم انٹرنیٹ استعمال کریں: اصل Python ڈاؤن لوڈ کیے بغیر Python کے بنیادی قواعد کی مشق کریں۔"
    }
  }
};
