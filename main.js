function expandMenu() {
   arw = document.getElementById("expansionArrow");
   Array.from(document.getElementsByClassName("menuelement")).forEach(function (element) {
      if (element.style.display == "block") {
         arw.innerHTML = "menu";
         element.style.display = "none";
      }
      else {
         arw.innerHTML = "close";
         element.style.display = "block";
      }
   });
}

function flipTheme() {
   icon = document.getElementById("themebtn");
   if (icon.innerHTML == "dark_mode") {
      document.body.style.backgroundColor = "#4F4F4B";
      icon.innerHTML = "light_mode";

      Array.from(document.getElementsByClassName("menuelement")).forEach(function (element) {
         element.style.filter = "brightness(85%)";
      });

      Array.from(document.getElementsByClassName("introheaders")).forEach(function (element) {
         element.classList.remove("text-dark");
         element.classList.add("text-light");
      });
   }
   else {
      document.body.style.backgroundColor = "#DBDBD0";
      icon.innerHTML = "dark_mode";

      Array.from(document.getElementsByClassName("menuelement")).forEach(function (element) {
         element.style.filter = "brightness(100%)";
      });

      Array.from(document.getElementsByClassName("introheaders")).forEach(function (element) {
         element.classList.remove("text-light");
         element.classList.add("text-dark");
      });
   }
}

