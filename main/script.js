calendarMain();

function calendarMain() {
    const DEFAULT_OPTION = "Choose category";

    let inputElem,
        inputElem2,
        dateInput,
        timeInput,
        addButton,
        sortButton,
        selectElem,
        todoList = [],
        time=[];

    getElements();
    addListeners();
    initCalendar();
    load();
    renderRows();
    updateSelectOptions();

    function getElements() {
        inputElem = document.getElementsByTagName("input")[0];
        inputElem2 = document.getElementsByTagName("input")[1];
        ulElem = document.getElementsByTagName("ul")[0];
        dateInput= document.getElementById("dateInput");
        timeInput = document.getElementById("timeInput");
        endInput = document.getElementById("endInput");
        addButton = document.getElementById("addBtn");
        sortButton = document.getElementById("sortBtn");
        drawButton = document.getElementById("drawBtn");
        selectElem = document.getElementById("categoryFilter");
    }

    function addListeners() {
        addButton.addEventListener("click", addEntry, false);
        sortButton.addEventListener("click", sortEntry, false);
        drawButton.addEventListener("click", drawChart, false);
        selectElem.addEventListener("change", filterEntries, false);
    }

    function addEntry(event) {

        let inputValue = inputElem.value;
        //ulElem.innerHTML += `"<li>" ${inputValue}  "</li>"`;
        inputElem.value = "";

        let inputValue2 = inputElem2.value;
        inputElem2.value = "";

        let dateValue = dateInput.value;
        dateInput.value = "";

        let timeValue = timeInput.value;
        timeInput.value = "";

        let endValue = endInput.value;
        endInput.value="";

        let obj = {
            id: _uuid(),
            todo: inputValue,
            category: inputValue2,
            date: dateValue,
            time: timeValue,
            end: endValue,
            done: false,
        };

        rendowRow(obj);

        todoList.push(obj);

        save();

        updateSelectOptions();

    }

    function filterEntries() {
        //empty table, keeping the first row
        let trElems = document.getElementsByTagName("tr");
        for (let i= trElems.length - 1; i >0; i--) {
            trElems[i].remove();
        }
        calendar.getEvents().forEach(event => event.remove());

        let selection = selectElem.value;

        if (selection == DEFAULT_OPTION) {
            todoList.forEach(obj => rendowRow(obj));

        } else {
            todoList.forEach(obj => {
                if (obj.category == selection) {
                    rendowRow(obj);
                }
            });    
        }
    }
    function updateSelectOptions() {
        let options = [];

        todoList.forEach((obj)=>{
            options.push(obj.category);
        })

        let optionSet = new Set(options);
        selectElem.innerHTML = "";
        let newOptionElem = document.createElement("option");
        newOptionElem.value = DEFAULT_OPTION;
        newOptionElem.innerText = DEFAULT_OPTION;
        selectElem.appendChild(newOptionElem);


        //options.forEach((option) => {
        for (let option of optionSet) {
            let newOptionElem = document.createElement("option");
            newOptionElem.value = option;
            newOptionElem.innerText = option;
            selectElem.appendChild(newOptionElem);
        }
        //});
    }
    function save() {
        let stringified = JSON.stringify(todoList);
        localStorage.setItem("todoList", stringified);
    }

    function load() {
        let retrieved = localStorage.getItem("todoList");
        todoList = JSON.parse(retrieved);
        if (todoList == null)
            todoList = [];
    }

    function renderRows() {
        todoList.forEach(todoObj => {
            

            // let todoEntry = todoObj["todo"];
            // let key = "category";
            // let todoCategory = todoObj[key];
            rendowRow(todoObj);
        })
    }

    function rendowRow({todo: inputValue, category: inputValue2, id, date, time,end, done}) {
        
        //add a new row
        let table = document.getElementById("calendarTable");

        let trElem = document.createElement("tr");
        table.appendChild(trElem);
        //checkbox cell
        let checkboxElem = document.createElement("input");
        checkboxElem.type = "checkbox";
        checkboxElem.addEventListener("click", checkClickCallback, false);
        checkboxElem.dataset.id = id; 
        let tdElem1 = document.createElement("td");
        tdElem1.appendChild(checkboxElem);
        trElem.appendChild(tdElem1);

        //date cell
        let dateElem = document.createElement("td");
        let dateObj = new Date(date);
        let formatedDate = dateObj.toLocaleString("en-GB",{
            month: "long",
            day: "numeric",
            year: "numeric",
        });
        dateElem.innerText = formatedDate;
        trElem.appendChild(dateElem);

        //time cell
        let timeElem = document.createElement("td");
        timeElem.innerText = time;   
        trElem.appendChild(timeElem);

        //end cell
        let endElem = document.createElement("td");
        endElem.innerText = end;
        trElem.appendChild(endElem)
        
        //todolist cell
        let tdElem2 = document.createElement("td");
        tdElem2.innerText = inputValue;
        trElem.appendChild(tdElem2);

        //category cell
        let tdElem3 = document.createElement("td");
        tdElem3.innerText = inputValue2;
        tdElem3.className = "categoryCell";
        trElem.appendChild(tdElem3);

        //delete cell
        let spanElem = document.createElement("span");
        spanElem.innerText = "delete";
        spanElem.className = "material-icons";
        spanElem.addEventListener("click", deleteItem, false);
        spanElem.dataset.id = id; 
        let tdElem4 = document.createElement("td");
        tdElem4.appendChild(spanElem);
        trElem.appendChild(tdElem4);

        checkboxElem.type = "checkbox";
        checkboxElem.checked = done;
        this.checked=done;
        if(done){
            trElem.classList.add("strike");
        }else{
            trElem.classList.remove("strike");
        }

        addEvent({
            id: id,
            title: inputValue,
            start: date,
        })
        function deleteItem() {
            trElem.remove();
            updateSelectOptions();

            for(let i = 0; i < todoList.length; i++){
                if(todoList[i].id == this.dataset.id)
                todoList.splice(i, 1);
            }
            save();

            //remove event from the calendar
            calendar.getEventById(this.dataset.id).remove();
            drawChart();
        }

        function checkClickCallback() {
            trElem.classList.toggle("strike");
            for(let i = 0; i < todoList.length; i++){
                if(todoList[i].id == this.dataset.id)
                todoList[i]["done"] = this.checked;
            }
            save();
        }
    };

    function _uuid() {
        var d = Date.now();
        if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
          d += performance.now(); //use high-precision timer if available
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          var r = (d + Math.random() * 16) % 16 | 0;
          d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }

    function sortEntry(){
        console.log("so running");
        todoList.sort((a,b) => {
            let aDate  = Date.parse(a.date);
            let bDate = Date.parse(b.date);
            return aDate - bDate;
        });

        save();
        let trElems = document.getElementsByTagName("Tr");
        

        let table = document.getElementById("calendarTable");
        table.innerHTML = `
        <tr>
            <td>Checkbox</td>
            <td>Date</td>
            <td>Start</td>
            <td>End</td>
            <td>to-do</td>
            <td>
                <select id="categoryFilter">
                    <option value=""></option>
                    <option value="Personal">Personal</option>
                    <option value="Work">Work</option>
                </select>
            </td>
            <td>delete</td>
        </tr>`;

        renderRows();
    };
    function initCalendar(){
        var calendarEl = document.getElementById('calendar');
            calendar = new FullCalendar.Calendar(calendarEl, {
                initialView: 'dayGridMonth',
                initialDate: '2021-08-01',
                headerToolbar: {
                    left: 'prev, next today',
                    center: 'title',
                    right:'dayGridMonth,timeGridWeek,timeGridDay'
                },
                events: [],
        });
        
        calendar.render();
    }
    function addEvent(event){
        calendar.addEvent( event);
    }
    function drawChart(){
        calculateTime();
        let day = [];
        todoList.forEach(obj =>{
            day.push(String(obj.date));
        })
        var ctx = document.getElementById('myChart').getContext('2d');
        var myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: day,
                datasets: [{
                    label: 'Time studying daily',
                    data: time,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    function calculateTime(){
        todoList.forEach(obj => {
            var start = obj.time;
            var end = obj.end;
            let start1 = '1/1/2021 ' + String(start);
            let end1 = '1/1/2021 ' + String(end);
            var  diff = (Math.abs(new Date(start1) - new Date(end1))/3600000).toFixed(2);
            console.log(diff);
            time.push(diff);
            });
    }
}

