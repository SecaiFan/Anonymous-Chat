let form = document.getElementById('formElement');
let checkBox = document.getElementById('checkbox');
let userMessage = document.getElementById('userMessage');
let typeValue = null;
let list = null, checkedList = null, lastId = null;

let controller = new AbortController();

async function update(lastSeen) {
    try {
        let idObj = {};
        let newElem;
        idObj['lastId'] = lastSeen;
        let data = await fetch('http://localhost:5004/chats/', {
            signal: controller.signal,
            method: 'PUT',
            headers: {'Content-Type': 'application/json;charset=utf-8'},
            body: JSON.stringify(idObj)
        });
        let jsonData = await data.json();
        if(!data.ok) {
            let msg = jsonData.message;
            throw new Error(msg);
        }
        console.log('jsonData: ' , jsonData);
        if(Object.values(jsonData).length > 0)lastSeen = Object.values(jsonData).at(-1).id;
        console.log('new:', lastSeen,'old:', lastId);
        console.log('new lastSeen: ', lastSeen);

        if(lastId !== lastSeen) {
            for (let [i, val] of Object.entries(jsonData)) {
                let chat = document.createElement('div');
                let href = document.createElement('a');

                chat.id = `chat${val.id}`;
                chat.innerText = `ChatType:${val.chat_type} Role:${val.relation_type}
                UsersAmount: ${val.participants_amount} Created: ${val.createdAt}`;
                chat.style.border = '2px solid #494949';
                chat.insertAdjacentHTML('afterbegin', `<h3>${val.title}<h3>`);

                href.href = `http://localhost:5004/chats/${val.id}`;
                href.style.cssText = `text-decoration: none; color: black;`;
                href.appendChild(chat);
                userMessage.prepend(href);
            }
            lastId = lastSeen;
        }
        return lastId;
    } catch(e) {
        console.log(e);
        userMessage.textContent = e.message;
    }
}

window.onload = () => {
    update(lastId);
}
let timerId = setInterval(() => update(lastId), 5000);
checkBox.onchange = async function ShowUserList() {
    list = document.getElementById('user_list');
    let beforeElem = list;

    list.style.display = checkBox.checked ? 'block' : 'none';

    if(checkBox.checked) {
        try {
            let data = await fetch('http://localhost:5004/user/getAll', {
                method: 'PUT'
            });
            let jsonData = await data.json();
            if(!data.ok) {
                let msg = jsonData.message;
                throw new Error(msg);
            }
            for(let [i, val] of Object.entries(jsonData)) {
                let option = document.createElement('option');
                option.id = i;
                option.innerText = val;
                beforeElem.append(option);
            }

            list = document.getElementById('user_list');
            console.log(list.options);
            list.onchange = async (e) => {
                console.log(list.options[list.selectedIndex].getAttribute('selected'));
                if(!list.options[list.selectedIndex].getAttribute('selected')) {
                    list.options[list.selectedIndex].setAttribute('selected', true)
                } else {
                    list.options[list.selectedIndex].removeAttribute('selected');
                    console.log(list.options[list.selectedIndex], 'убрано');
                }
            }
        } catch(e) {
            console.log(e);
            userMessage.textContent = e.message;
        }
    }
};

list = document.getElementById('user_list');
list.onchange = async (e) => {
    if (!list.options[list.selectedIndex].getAttribute('selected')) {
        list.options[list.selectedIndex].setAttribute('selected', true)
    } else {
        list.options[list.selectedIndex].removeAttribute('selected');
    }
}

form.onsubmit = async function getData(event) {
    checkedList = document.getElementsByTagName('option');
    console.log(list);
    let participants = [];
    let lastSeen = null;
    event.preventDefault();
    try {
        for(let elem of list) {
            if (elem) {
                if(elem.hasAttribute('selected')) participants.push(elem.id);
            }
        }

        typeValue = document.getElementById('checkbox').checked ? 'PRIVATE' : 'COMMON';

        let formData = new FormData(form);
        formData.append('participants', JSON.stringify(participants));
        formData.append('type', typeValue);
        let jsonForm = {};
        formData.forEach((value, key) => jsonForm[key] = value);
        console.log(JSON.stringify(jsonForm));
        let data = await fetch('http://localhost:5004/chats/', {
            method: 'POST',
            headers: {'Content-Type': 'application/json;charset=utf-8'},
            body: JSON.stringify(jsonForm)
        });
        if(!data.ok) {
            let jsonData = await data.json();
            let msg = jsonData.message;
            throw new Error(msg);
        }else {
            document.getElementById('userMessage').textContent = '';
            /*window.location.replace("http://localhost:5004/chats");*/
        }
        let jsonData = await data.json();
        await update(lastSeen);
    } catch (e) {
        console.error(e);
        userMessage.textContent = e.message;
    }
}