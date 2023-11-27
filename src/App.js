import React, { useEffect, useState } from "react";
import axios from "axios";
import { useCallback } from "react";
import "./App.css";

import List from "./Components/List/List";
import Navbar from "./Components/NavBar/NavBar";

function App() {
  const TodoStatusList = [
    "In progress",
    "Backlog",
    "Todo",
    "Done",
    "Cancelled",
  ];
  const [userList, setUserList] = useState([]);
  const SortPriorityList = [
    { name: "No priority", priority: 0 },
    { name: "Low", priority: 1 },
    { name: "Medium", priority: 2 },
    { name: "High", priority: 3 },
    { name: "Urgent", priority: 4 },
  ];

  const [groupVal, setgroupVal] = useState(
    getState() || "status"
  );
  const [orderValue, setorderValue] = useState("title");
  const [ticketData, setticketData] = useState([]);

  // here I have used callBack hook to memoized the sorting,
  // as our tickets are not changing, so we don't need to resort the arrays
  // then we can memoized the different sorted array using callBack
  const orderDataByValue = useCallback(
    async (cardsArry) => {
      if (orderValue === "priority") {
        cardsArry.sort((a, b) => b.priority - a.priority);
      } else if (orderValue === "title") {
        cardsArry.sort((a, b) => {
          const tA = a.title.toLowerCase();
          const tB = b.title.toLowerCase();

          if (tA < tB) {
            return -1;
          } else if (tA > tB) {
            return 1;
          } else {
            return 0;
          }
        });
      }
      await setticketData(cardsArry);
    },
    [orderValue, setticketData]
  );

  function saveStateToLocalStorage(state) {
    localStorage.setItem("groupVal", JSON.stringify(state));
  }

  function getState() {
    const storedState = localStorage.getItem("groupVal");
    if (storedState) {
      return JSON.parse(storedState);
    }
    return null;
  }

  useEffect(() => {
    saveStateToLocalStorage(groupVal);
    async function fetchData() {
      const response = await axios.get(
        "https://api.quicksell.co/v1/internal/frontend-assignment"
      );
      await addUser(response);
    }
    fetchData();
    async function addUser(response) {
      let ticketArray = [];
      if (response.status === 200) {
        for (let i = 0; i < response.data.tickets.length; i++) {
          for (let j = 0; j < response.data.users.length; j++) {
            if (response.data.tickets[i].userId === response.data.users[j].id) {
              let ticketJson = {
                ...response.data.tickets[i],
                userObj: response.data.users[j],
              };
              ticketArray.push(ticketJson);
            }
          }
        }
        let UserArray = [];
        for (let j = 0; j < response.data.users.length; j++) {
          UserArray.push(response.data.users[j].name);
        }
       
        setUserList(UserArray);
      }

      await setticketData(ticketArray);
      orderDataByValue(ticketArray);
    }
  }, [orderDataByValue, groupVal]);

  function handlegroupVal(value) {
    setgroupVal(value);
    console.log(value);
  }

  function handleOrderValue(value) {
    setorderValue(value);
    console.log(value);
  }

  return (
    <>
      <Navbar
        groupVal={groupVal}
        orderValue={orderValue}
        handlegroupVal={handlegroupVal}
        handleOrderValue={handleOrderValue}
      />
      <section className="board-details">
        <div className="board-details-list">
          {
            {
              status: (
                <>
                  {TodoStatusList.map((listItem) => {
                    return (
                      <List
                        groupVal="status"
                        orderValue={orderValue}
                        listTitle={listItem}
                        listIcon=""
                        TodoStatusList={TodoStatusList}
                        ticketData={ticketData}
                      />
                    );
                  })}
                </>
              ),
              user: (
                <>
                  {userList.map((listItem) => {
                    return (
                      <List
                        groupVal="user"
                        orderValue={orderValue}
                        listTitle={listItem}
                        listIcon=""
                        userList={userList}
                        ticketData={ticketData}
                      />
                    );
                  })}
                </>
              ),
              priority: (
                <>
                  {SortPriorityList.map((listItem) => {
                    return (
                      <List
                        groupVal="priority"
                        orderValue={orderValue}
                        listTitle={listItem.priority}
                        listIcon=""
                        SortPriorityList={SortPriorityList}
                        ticketData={ticketData}
                      />
                    );
                  })}
                </>
              ),
            }[groupVal]
          }
        </div>
      </section>
    </>
  );
}

export default App;
