// 确保DOM完全加载
// 使用require代替import以兼容当前环境
const { solarToLunar } = require('chinese-lunar-calendar');

// 获取当前日期
function getCurrentDate() {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate()
  };
}

// 确保DOM完全加载
window.onload = function() {
  // 获取日期相关元素
  const dateInput = document.getElementById('birthday');
  const lunarDate = document.getElementById('lunar-date');

  // 更新农历日期显示
  function updateLunarDate() {
    const dateStr = dateInput.value;
    const lunar = solarToLunar(new Date(dateStr));
    lunarDate.textContent = `农历：${lunar}`;
  }

  // 初始化日期
  dateInput.value = '1990-01-01';
  updateLunarDate();

  // 绑定日期输入事件
  dateInput.addEventListener('change', updateLunarDate);
  const userForm = document.getElementById('user-form');
  const paymentForm = document.querySelector('.payment-form');
  const quoteBox = document.querySelector('.quote-box');
  const quoteText = document.getElementById('quote-text');
  
  // 初始化隐藏运势结果区域
  if (quoteBox) {
    quoteBox.style.display = 'none';
  }
  if (quoteText) {
    quoteText.style.display = 'none';
  }
  
  // 处理用户信息表单提交
  userForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // 获取表单数据
    const name = document.getElementById('name').value;
    const gender = document.getElementById('gender').value;
    const birthday = document.getElementById('birthday').value;
    
    // 验证表单数据
    if (!name || !gender || !birthday) {
      alert('请填写完整信息');
      return;
    }
    
    // 验证生日格式和有效性
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(birthday)) {
      alert('生日格式不正确，请使用YYYY-MM-DD格式');
      return;
    }
    
    const [year, month, day] = birthday.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    // 验证日期有效性
    if (date.getFullYear() !== year || 
        date.getMonth() + 1 !== month || 
        date.getDate() !== day) {
      // 处理闰年2月29日
      if (month === 2 && day === 29) {
        if (!isLeapYear(year)) {
          alert(`${year}年不是闰年，2月没有29日`);
          return;
        }
      } else {
        alert('请输入有效的日期');
        return;
      }
    }
    
    // 验证年龄范围
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const minBirthYear = currentYear - 120;
    const maxBirthYear = currentYear - 13;
    
    if (year < minBirthYear || year > maxBirthYear) {
      alert(`请输入${minBirthYear}年至${maxBirthYear}年之间的有效年份`);
      return;
    }
    
    // 验证是否为未来日期
    if (date > currentDate) {
      alert('生日不能是未来日期');
      return;
    }
    
    // 验证最小年龄
    const age = currentYear - year;
    if (age < 13) {
      alert('您必须年满13岁才能使用本服务');
      return;
    }
    
    // 闰年判断函数
    function isLeapYear(year) {
      return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    }
    
    // 保存用户偏好
    saveUserPreferences({ name, gender, birthday });
    
    // 切换到支付界面
    userForm.parentElement.style.display = 'none';
    paymentForm.style.display = 'block';
  });

  // 处理立即查看按钮点击
  document.getElementById('pay-btn').addEventListener('click', function(e) {
    e.preventDefault();
    // 隐藏支付表单
    paymentForm.style.display = 'none';
    
    // 显示加载动画
    const spinner = document.querySelector('.loading-spinner');
    if (spinner) {
      spinner.style.display = 'flex';
    }
    
    // 隐藏返回按钮
    document.getElementById('back-btn').style.display = 'none';

    // 模拟3秒加载时间
    setTimeout(async () => {
      // 隐藏加载动画
      if (spinner) {
        spinner.style.display = 'none';
      }

      // 获取运势结果
      const result = await getFortune();
      
      // 显示运势结果
      displayFortune(result);
      setupSocialSharing(result);
      setupFeedbackForm();
      
      // 显示返回按钮
      document.getElementById('back-btn').style.display = 'block';
    }, 3000);
  });

  // 处理获取新运势按钮
  document.getElementById('new-quote-btn').addEventListener('click', function() {
    alert('请重新支付以获取新运势');
  });

  // 处理返回主页按钮
  document.getElementById('back-btn').addEventListener('click', function() {
    // 隐藏运势显示区域
    quoteBox.style.display = 'none';
    // 显示用户信息表单
    userForm.parentElement.style.display = 'block';
    // 重置表单
    userForm.reset();
    // 隐藏返回按钮
    this.style.display = 'none';
  });

  // 初始化用户偏好
  loadUserPreferences();
};

// 获取运势
async function getFortune() {
  const fortuneTypes = {
    overall: [
      {
        title: '幸运之星',
        content: '今天你会遇到意想不到的好运，抓住机会！',
        color: '#FFD700',
        icon: '🌟',
        analysis: '今天整体运势极佳，适合尝试新事物和做出重要决定。'
      },
      // 更多运势数据...
    ],
    // 其他运势类型...
  };

  const selectedType = document.querySelector('input[name="fortune-type"]:checked').value;
  const fortunes = fortuneTypes[selectedType];
  return fortunes[Math.floor(Math.random() * fortunes.length)];
}

// 显示运势
function displayFortune(result) {
  const quoteBox = document.querySelector('.quote-box');
  const quoteText = document.getElementById('quote-text');
  
  quoteText.innerHTML = `
    <div class="fortune-header" style="color: ${result.color}">
      <span class="fortune-icon">${result.icon}</span>
      <h2>${result.title}</h2>
    </div>
    <div class="fortune-content">
      <p>${result.content}</p>
      <div class="fortune-analysis">
        <h3>详细分析</h3>
        <p>${result.analysis}</p>
      </div>
    </div>
  `;
  quoteText.style.borderColor = result.color;
  
  quoteBox.classList.add('fade-in');
  quoteBox.style.display = 'block';
  quoteText.style.display = 'block';
}

// 社交分享功能
function setupSocialSharing(result) {
  const shareText = `我的今日运势：${result.title} - ${result.content}`;
  
  // 微信分享
  document.getElementById('wechat-share').onclick = () => {
    alert('请使用微信扫描二维码分享');
    // 这里可以添加生成二维码的逻辑
  };

  // 微博分享
  document.getElementById('weibo-share').onclick = () => {
    const url = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };
}

// 保存用户偏好
function saveUserPreferences(prefs) {
  localStorage.setItem('userPreferences', JSON.stringify(prefs));
}

// 加载用户偏好
function loadUserPreferences() {
  const prefs = JSON.parse(localStorage.getItem('userPreferences'));
  if (prefs) {
    document.getElementById('name').value = prefs.name || '';
    document.getElementById('gender').value = prefs.gender || '';
    document.getElementById('birthday').value = prefs.birthday || '';
  }
}

// 用户反馈功能
function setupFeedbackForm() {
  document.getElementById('submit-feedback').addEventListener('click', () => {
    const feedback = document.getElementById('feedback-text').value;
    if (feedback) {
      // 这里可以添加发送反馈到服务器的逻辑
      alert('感谢您的反馈！');
      document.getElementById('feedback-text').value = '';
    } else {
      alert('请填写反馈内容');
    }
  });
}
