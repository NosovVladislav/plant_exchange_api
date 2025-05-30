document.addEventListener('DOMContentLoaded', async () => {
    await loadPlants();
    await loadHistory();
    await loadOffers();
});

async function loadPlants() {
    const response = await fetch('/plants');
    const plants = await response.json();
    const container = document.getElementById('plants');
    container.innerHTML = plants.map(plant => `
        <div class="plant">
            <img src="${plant.image}" alt="${plant.name}" width="100">
            <p>${plant.name}</p>
        </div>
    `).join('');
}
async function loadHistory() {
    try {
        const response = await fetch('/history');
        if (!response.ok) throw new Error('Ошибка загрузки истории');

        const rawHistory = await response.json();
        const history = rawHistory.map(item => ({
            text: item.description, // << здесь главное изменение
            date: new Date().toISOString(), 
        }));

        const container = document.getElementById('history');

        container.innerHTML = `
            <div class="history-grid">
                ${history.map(item => `
                    <div class="history-card">
                        <div class="history-text">${item.text}</div>
                        <div class="history-date">${formatDate(item.date)}</div>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        console.error(error);
        const container = document.getElementById('history');
        container.innerHTML = '<div class="history-card">Не удалось загрузить историю</div>';
    }
}



function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

async function loadOffers() {
    const response = await fetch('/offers');
    const offers = await response.json();
    const container = document.getElementById('offers');
    container.innerHTML = offers.map(offer => `
        <div class="offer">
            <img src="${offer.image}" alt="${offer.title}" width="100">
            <p><strong>${offer.title}</strong></p>
            <p>${offer.description}</p>
            <button onclick="respondOffer('${offer.id}', '${offer.title}')">Откликнуться</button>
        </div>
    `).join('');
}

async function respondOffer(offerId, offerTitle) {
    const response = await fetch('/respond-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: offerId, title: offerTitle })
    });

    if (response.ok) {
        alert('Вы откликнулись на предложение!');
        await loadOffers();
        await loadHistory();
    } else {
        const error = await response.text();
        alert('Ошибка отклика: ' + error);
    }
}

document.getElementById('add-offer-btn').addEventListener('click', () => {
    document.getElementById('add-offer-form').style.display = 'block';
});

document.getElementById('submit-offer-btn').addEventListener('click', async () => {
    const title = document.getElementById('offer-title').value.trim();
    const description = document.getElementById('offer-description').value.trim();
    const image = document.getElementById('offer-image').files[0];

    if (!title || !description || !image) {
        alert('Заполните все поля');
        return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('image', image);

    const response = await fetch('/add-offer', {
        method: 'POST',
        body: formData
    });

    if (response.ok) {
        alert('Объявление добавлено!');
        window.location.reload();
    } else {
        const error = await response.text();
        alert('Ошибка добавления: ' + error);
    }
});

async function addHistory(description) {
    const response = await fetch('/add-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
    });

    if (response.ok) {
        alert('История добавлена!');
        await loadHistory();
    } else {
        const error = await response.text();
        alert('Ошибка добавления истории: ' + error);
    }
}

function respondToOffer(id, title) {
    fetch('/respond-offer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, title }),
    })
    .then(response => {
        if (response.ok) {
            alert('Отклик отправлен!');
            // Обновляем страницу чтобы пропало объявление и обновилась история
            location.reload()
        } else {
            alert('Ошибка отклика');
        }
    })
    .catch(error => {
        console.error('Ошибка при отклике:', error);
        alert('Ошибка при отклике');
    });
}

document.getElementById('show-history-btn').addEventListener('click', async () => {
    document.getElementById('history-title').style.display = 'block';
    document.getElementById('history').style.display = 'block';
    await loadHistory();
});

document.getElementById('show-history-btn').addEventListener('click', async () => {
    const historyContainer = document.getElementById('history');

    if (historyContainer.style.display === 'none' || historyContainer.style.display === '') {
        // Показать блок и загрузить историю
        historyContainer.style.display = 'block';
        await loadHistory();
    } else {
        // Скрыть блок
        historyContainer.style.display = 'none';
    }
});




  const chatWidget = document.getElementById('chat-widget');
  const chatMessages = document.getElementById('chat-messages');
  const userInput = document.getElementById('user-input');

  document.getElementById('open-chat').onclick = () => {
    chatWidget.style.display = 'flex';
    document.getElementById('open-chat').style.display = 'none';
  };

  document.getElementById('chat-header').onclick = () => {
    chatWidget.style.display = 'none';
    document.getElementById('open-chat').style.display = 'block';
  };


  function addMessage(sender, text) {
    const msg = document.createElement('div');
    msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function botReply(message) {
    message = message.toLowerCase();
    if (message.includes('как добавить растение')) return 'пролистайте вниз страницы,\
     и нажмите кнопку "Добавить обЪявление", затем заполните все поля и нажмите "Отправить"';
    if (message.includes('как просмотреть историю обменов')) return 'Пролистайте в верх стрницы и нажмите "История обменов"';
    if (message.includes('как откликнуться на объявление')) return 'Навидите курсор на кнопку "Откликнуться под объявлением"\
    и нажмите её';
    if (message.includes('cпасибо')) return 'Всегда рад помочь!!!!!!!!!';
    
    return 'Извините, я пока не понимаю такие запросы.';
  }

 


  function sendPredefined(text) {
    addMessage('Вы', text);
    const reply = botReply(text);
    setTimeout(() => {
      addMessage('Бот', reply);
    }, 500);
  }


