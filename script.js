const proxyurl = "https://cors-anywhere.herokuapp.com/"; 
const url = "https://mrsoft.by/tz20/list.json"; 
const base = 'https://mrsoft.by/tz20';
const master = document.querySelector('.master-content');
const ul = document.createElement('ul');
const input = document.querySelector('input');
let resChanceData = []; //массив для измененных данных
let needDeleteItem = {};
let needAddItem = {};
let chancedDataFlag = 0;

async function getData(moreUrl, imgUrl) {
    let allUrl = proxyurl + url;
    if (moreUrl) {
        allUrl = proxyurl + base + moreUrl;
    }

    if(imgUrl){
        allUrl = imgUrl;
        let response = await fetch(allUrl,  
            {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
        const dataImg = await response.text();
        return dataImg;
    }

    let response = await fetch(allUrl);
    const dataObj = await response.json();
    return dataObj;
}

function createUl(deletedItem, addItem) {
    let countDelededEl = 0;
    ul.classList.add('ul-in-master');
    ul.innerHTML = '';

    let dataMaster = getData()
    .then(dataObj => {

        if(chancedDataFlag > 0) { //если данные изменяютя(удаление,добавление)
            chancedDataFlag = 0;
            if(needDeleteItem.id) { //если есть элемент для удаления
                needDeleteItem.flag = 'del';
                resChanceData.push(needDeleteItem); //добавляем в конец удаленный элемент
                resChanceData.map((item, index) => {
                    if(item.id == needDeleteItem.id && index < resChanceData.length - 2) { //удаляем ненужный элемент из двух 
                        resChanceData.splice(index,1);
                    }
                });
                
                resChanceData.map((item, index) => {
                    createLi(item);
                });
                needDeleteItem = {};
            }
            else if(needAddItem.id) { //если есть элемент на добавление 
                needAddItem.flag = '';
                resChanceData.unshift(needAddItem); //добавляем в начало массива
                resChanceData.map((item,index) => {
                    if(item.id == needAddItem.id && index!=0) { //нужно удалить прошлый элемент
                        resChanceData.splice(index,1);
                    } 
                });
                resChanceData.map((item, index) => {
                    createLi(item);
                });
                needAddItem = {};
            }
        }
        else { //данные не изменяются
            dataObj.data.map((item, index) =>{
                resChanceData = sendGlobalData(dataObj.data);
                createLi(item);
             });
        }
    
        master.appendChild(ul);

    }).catch(err => console.log(err));
}
function getDeletedDate() { //функция возвращает текущую дату и время
    const nowDate = new Date();
    let day = nowDate.getDate();
    let month = nowDate.getMonth();
    const year = nowDate.getFullYear()
    let hour = nowDate.getHours();
    let minute = nowDate.getMinutes();

    day = (day<9)?`0${day}`:day;
    month = (month<9)?`0${month}`:month;
    hour = (hour<9)?`0${hour}`:hour;
    minute= (minute<9)?`0${minute}`:minute;

    const deletedPhrase = `deleted at ${day}.${month}.${year} @ ${hour}:${minute}`;
    return deletedPhrase;
}
function createLi(item) {
    const cross = document.createElement('img');
    cross.src = 'img/red-cross.png';
    cross.classList.add('red-cross');
    const li = document.createElement('li');
    const pName = document.createElement('p');
    pName.textContent = item.name;
    pName.classList.add('title'); 
    const pShortInfo = document.createElement('p');
    pShortInfo.textContent = item.shortInfo;
    const greenArrow = document.createElement('img');
    greenArrow.src = 'img/green-arrow.jpg';
    greenArrow.classList.add('green-arrow')
    const containerInfo = document.createElement('div');
    containerInfo.classList.add('container-text-li');
    containerInfo.style.pointerEvents = 'auto';
    const containerArrows = document.createElement('div');
    containerArrows.classList.add('container-arrows');
 
    containerInfo.appendChild(pName);
    containerInfo.appendChild(pShortInfo);
    containerArrows.appendChild(cross);

    if(item.flag == 'del'){ // стили для удаленного элемента
        li.style.color = 'darkgrey';
        li.style.border = '1px solid grey';
        containerInfo.style.pointerEvents = 'none';
        cross.style.pointerEvents = 'none';
        cross.classList.add('deleted');
        const addDeletePhrase = document.createElement('p');
        addDeletePhrase.textContent = getDeletedDate();
        containerInfo.appendChild(addDeletePhrase);
        containerArrows.appendChild(greenArrow);
    }

    containerInfo.addEventListener('click', e => {
        e.preventDefault();
        createDetails(item);
    });
    
    cross.addEventListener('click', e => {
        e.preventDefault();
        ++chancedDataFlag;
        needDeleteItem = item;
        createUl(item);
    });
    
    greenArrow.addEventListener('click', e => {
        e.preventDefault();
        ++chancedDataFlag;
        needAddItem = item;
        createUl('',item);
    });

    li.appendChild(containerInfo);
    li.appendChild(containerArrows);
    ul.appendChild(li);
}

function createDetails(item) {
    const detail = document.querySelector('.details');
    const containerDetailText = document.createElement('div');
    containerDetailText.classList.add('containerDetailText'); 
    const containerImg = document.createElement('div');
    containerImg.classList.add('containerImg');
    for (let key in item) {
        if (key == 'more') {
             let moreUrl = item[key];
             let dataDetailsPromise = getData(moreUrl);
             dataDetailsPromise.then(detailsObj => {
                 detail.innerHTML = '';
                 const name = document.createElement('div');
                 name.textContent = item.name;
                 name.classList.add('title');
                 containerDetailText.appendChild(name);

                 const pShortInfo = document.createElement('p');
                 pShortInfo.textContent = item.shortInfo;
                 containerDetailText.appendChild(pShortInfo);

                 const bio = document.createElement('p');
                 bio.textContent = detailsObj.bio;
                 containerDetailText.appendChild(bio);
                 detail.appendChild(containerDetailText);

                 const img = document.createElement('img');
                 img.src = proxyurl + base + detailsObj.pic;
                 img.classList.add('cardCat');
                 getData('',proxyurl + base + detailsObj.pic);
                 containerImg.appendChild(img);
                 detail.appendChild(containerImg);
             }).catch(err => console.log(err));
        }
    }
}

input.addEventListener('input', e => {
    e.preventDefault();
    const filterInputName = document.createElement('li');
    const dataPromise = getData();
    dataPromise.then(dataObj => {    
        let filterValue = dataObj.data.filter(item => {
            return item.name.toLowerCase().indexOf(input.value.toLowerCase(), 0) > -1 ; //фильтрация по имени
        });
          if(input.value) {
           ul.innerHTML = '';
              filterValue.forEach(item => {
              createLi(item);
              });
           }
           else{
              ul.innerHTML = ''; 
             createUl();
           }
       });
    });
  
function sendGlobalData(globalDataArr) {
    return globalDataArr;
}

createUl();
