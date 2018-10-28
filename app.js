// Form Data Controller
var inputDataController = function () {
     var Input = function (id, question, type) {
          this.id = id;
          this.question = question;
          this.type = type;
          this.subInputs = [];
     }

     var SubInput = function (id, condition, answer, question, type) {
          Input.call(this, id, question, type);
          this.condition = {
            conditions: condition, 
            answers: answer
          }
     }

     var inputsData = [];

     return {
            addInputData: function (question, type) {
               var id;

               if (inputsData.length > 0) {
                    id = inputsData[inputsData.length - 1].id + 1;
               } else {
                    id = 0;
               }

               inputsData.push(new Input(id, question, type));

               return [id];
            },

            addSubInputData: function (idChain, condition, answer, question, type) {
                var parentInput, 
                    parentInputsIDs, 
                    parentInputIndex;

                for(var i = 0; i < idChain.length; i++) {
                    if (i === 0) {
                         parentInputsIDs = inputsData.map((input)=>{
                              return input.id;
                         });
                         parentInputIndex = parentInputsIDs.indexOf(idChain[i]);
                         parentInput = inputsData[parentInputIndex];
                    } else {
                         parentInputsIDs = parentInput.subInputs.map((subInput)=>{
                              return subInput.id;
                         });
                         parentInputIndex = parentInputsIDs.indexOf(idChain[i]);
                         parentInput = parentInput.subInputs[parentInputIndex]; 
                    }
                }

                if (parentInput) {
                    if (parentInput.subInputs.length > 0) {
                         newSubInputID = parentInput.subInputs[parentInput.subInputs.length - 1].id + 1;
                    } else {
                         newSubInputID = 0;
                    }
                    parentInput.subInputs.push(new SubInput(newSubInputID, condition, answer, question, type));
                    idChain.push(newSubInputID);

                    return idChain;

                } else {
                    console.error('From addSubInputData - cannot find parent input in data structure!');
                }
            },

            indexFromId: function (inputs, inputDataId) {
                var inputsIDs = inputs.map((input)=>{
                    return input.id;
                });
                return inputsIDs.indexOf(inputDataId);
            },
            
            findInputById: function (inputs, idChain) {
                var id, index, inputs, input;

                for(var i = 0; i < idChain.length; i++) {
                    id = idChain[i];
                    index = this.indexFromId(inputs, id);
                    if(index === -1) {
                        return -1;
                    }
                    input = inputs[index];
                    inputs = input.subInputs;
                }
                return input;
            },

            removeInputData: function (idChain) {
                var id = idChain.pop();
                var inputs, index;
                if(idChain.length !== 0) {
                    inputs = this.findInputById(inputsData, idChain).subInputs;
                } else {
                    inputs = inputsData;
                }
                
                index = this.indexFromId(inputs, id);

                if (index !== -1) {
                    inputs.splice(index, 1);
                }
            },

            updateInputData: function (idChain, propertyName, value) {
                var input = this.findInputById(inputsData, idChain);
                input[propertyName] = value;
                // console.log(input);    
            },

            showInputs: function () {
                console.log(inputsData);
            },

            getInputs: function () {
                return inputsData;
            }
     }
}();

// UI Controller
var UIController = function () {
     var DOMstrings = {
          inputsContainer: document.querySelector('.inputsContainer'),
          addInputBtn: document.querySelector('.addInputBtn'),
     }
     
     return {
          getDOMstrings: function () {
               return DOMstrings;
          },

          blockSelect: function (elementId) {
            document.getElementById(elementId+'_type').disabled = true;
          },

          unblockSelect: function (elementId) {
            document.getElementById(elementId+'_type').disabled = false;
          },

          addInputElement: function (elementId) {
               var inputHtml = `
                    <div id="${elementId}">
                    <div class="input-container">
                         <label for="${elementId}_question">Question</label>
                         <input type="text" id="${elementId}_question">

                         <label for="${elementId}_type">Type</label>
                         <select id="${elementId}_type">
                                   <option value="Yes/No" selected>Yes/No</option>
                                   <option value="Text">Text</option>
                                   <option value="Number">Number</option>
                         </select>

                         <input class="addSubInputBtn" type="submit" value="Add Sub-Input">
                         <input class="deleteInput" type="submit" value="Delete">
                    </div>     
                    </div>`;

               DOMstrings.inputsContainer.insertAdjacentHTML('beforeend', inputHtml);
          },

        addSubInputElement: function (elementId, previousElementId, parentelementType) {
            var condition, answer;

               if (parentelementType === 'Number') {
                    condition = `<option value="Equals" selected>Equals</option>
                    <option value="Greater" selected>Greater than</option>
                    <option value="Less" selected>Less than</option>`;
                    answer = `<input type="number" id="${elementId}_answer">`;
               } else if (parentelementType === 'Text') {
                condition = `<option value="Equals" selected>Equals</option>`
                answer = `<input type="text" id="${elementId}_answer">`;
               } else if (parentelementType === 'Yes/No') {
                    condition = `<option value="Equals" selected>Equals</option>`;
                    answer = `<select id="${elementId}_answer">
                    <option value="Yes" selected>Yes</option>
                    <option value="No">No</option>
                    </select>`;
               }

            var subInputHtml = `
                    <div id="${elementId}">
                        <div class="input-container">
                         <label for="${elementId}_condition">Condition</label>
                         <select id="${elementId}_condition">
                              ${condition}
                         </select>
                         
                        ${answer}
                        

                         <label for="${elementId}_question">Question</label>
                         <input type="text" id="${elementId}_question">

                         <label for="${elementId}_type">Type</label>
                         <select id="${elementId}_type">
                            <option value="Yes/No" selected>Yes/No</option>
                            <option value="Text">Text</option>
                            <option value="Number">Number</option>
                         </select>
                         
                         <input class="addSubInputBtn" type="submit" value="Add Sub-Input">
                         <input class="deleteInput" type="submit" value="Delete">
                         </div>
                    </div>`;
                    document.getElementById(previousElementId).insertAdjacentHTML('beforeend', subInputHtml);
          },

          removeInputElement: function (inputID) {
               var inputElement = document.getElementById(inputID);

            //    if (inputElement.children.length > 0) {
            //         while (inputElement.firstChild) {
            //             inputElement.removeChild(inputElement.firstChild);
            //         }
            //    }

               inputElement.parentElement.removeChild(inputElement);
          },

          idChainFromElementId: function (inputElementId) {
               var idChain = inputElementId.split('-');
               idChain = idChain.map(id=> parseInt(id));
               return idChain;  
          },

          inputElementIdFromIdChain: function (idChain) {
               var inputElementId = idChain.join('-');
               return inputElementId;
          }
     }
}();

// App Controller
var appController = function (UICtrl, inputDataCtrl) {
     var DOM = UICtrl.getDOMstrings();

     var setupEventListeners = function () {          
          DOM.addInputBtn.addEventListener('click', addInput);
          DOM.inputsContainer.addEventListener('click', removeInput);
          DOM.inputsContainer.addEventListener('click', addSubInput);
          DOM.inputsContainer.addEventListener('change', updateInput);
          DOM.inputsContainer.addEventListener('keypress', updateInput);
     }

     var addInput = function () {
          var id, newInputElement;

          id = inputDataCtrl.addInputData('', 'Yes/No');
          UICtrl.addInputElement(id);
        //   newInputElement = document.getElementById(id);
        //   newInputElement.children[1].addEventListener('keypress', updateInput);
        //   newInputElement.children[3].addEventListener('change', updateInput);

     }

     var addSubInput = function (e) {
          var btnClass = e.target.className;
          if (btnClass === 'addSubInputBtn') {
               var parentInputElementId, parentInputElementIdChain, newInputDataIdChain, lastSubInputDataId,
               previousElementId, parentInputData, newSubInputElement;

               parentInputElementId = e.target.parentElement.parentElement.id;
               parentInputElementIdChain = UICtrl.idChainFromElementId(parentInputElementId);
                parentInputData = inputDataCtrl.findInputById(inputDataCtrl.getInputs(), parentInputElementIdChain);

                console.log(parentInputData);
                

               newInputDataIdChain = inputDataCtrl.addSubInputData(parentInputElementIdChain, '', '', '', '');
               newElementId = UICtrl.inputElementIdFromIdChain(newInputDataIdChain);
               UICtrl.addSubInputElement(newElementId, parentInputElementId, parentInputData.type);
               UICtrl.blockSelect(parentInputElementId);
               newSubInputElement = document.getElementById(newElementId);
               inputDataCtrl.updateInputData(newInputDataIdChain, 'condition', newSubInputElement.firstElementChild.children[1].value);
               inputDataCtrl.updateInputData(newInputDataIdChain, 'answer', newSubInputElement.firstElementChild.children[2].value);
               inputDataCtrl.updateInputData(newInputDataIdChain, 'question', newSubInputElement.firstElementChild.children[4].value);
               inputDataCtrl.updateInputData(newInputDataIdChain, 'type', newSubInputElement.firstElementChild.children[6].value);
          }
     }

     var removeInput = function (e) {
          var btnClass = e.target.className;
          
          if (btnClass === 'deleteInput') {
               var inputId, inputIdChain;

               inputId = e.target.parentElement.parentElement.id;

               inputIdChain = UICtrl.idChainFromElementId(inputId);

               if (e.target.parentElement.parentElement.parentElement.id) {
                UICtrl.unblockSelect(e.target.parentElement.parentElement.parentElement.id);
               }
               inputDataCtrl.removeInputData(inputIdChain);
               UICtrl.removeInputElement(inputId);

          }
     }

     var updateInput = function (e) {
        var inputElement = e.target.parentElement.parentElement,
            idChain = UICtrl.idChainFromElementId(inputElement.id),
            targetId = e.target.id,
            propertyName = targetId.slice(targetId.indexOf('_') + 1, targetId.length);
            value = e.target.value;
            // console.log(value);

        if(e.type === 'change' && e.target.localName === 'select' ) {
            inputDataCtrl.updateInputData(idChain, propertyName, value);
        } else if(e.type === 'keypress' && e.target.localName === 'input' ) {
            inputDataCtrl.updateInputData(idChain, propertyName, value);
        }
     }

     return {
          init: function () {
               console.log('The application started!'); 
               setupEventListeners();
          }
     }     
}(UIController, inputDataController);

appController.init();