// MVC's view
class MapEditorHtml {
    #controller;
    
    decreaseViewHeightButton = document.getElementById('decrease-view-height');
    increaseViewHeightButton = document.getElementById('increase-view-height');
    decreaseViewWidthButton = document.getElementById('decrease-view-width');
    increaseViewWidthButton = document.getElementById('increase-view-width');

    toggleEditorButton = document.getElementById('toggle-editor');

    #controlsContainer;
    toggleGridCheckbox;
    toggleMaxViewCheckbox;
    
    constructor(controller) {
        this.#controller = controller;
        this.#controller.html = this;
        this.#addEventListeners();
    }

    #addEventListeners() {
        // document.addEventListener('keydown', this.inputController);

        // decreaseViewButton.addEventListener('click', funcName);
        // this.#decreaseViewHeightButton.addEventListener('click', function() {
        //     this.#game.view.resizeBy(0, -2);
        //     updateView();
        // });
        this.decreaseViewHeightButton.addEventListener('click', this.#controller);
        this.increaseViewHeightButton.addEventListener('click', this.#controller);
        this.decreaseViewWidthButton.addEventListener('click', this.#controller);
        this.increaseViewWidthButton.addEventListener('click', this.#controller);
        
        // increaseViewHeightButton.addEventListener('click', function() {
        //     this.#game.view.resizeBy(0, 2);
        //     updateView();
        // });
        
        // decreaseViewWidthButton.addEventListener('click', function() {
        //     this.#game.view.resizeBy(-2, 0);
        //     updateView();
        // });
        
        // increaseViewWidthButton.addEventListener('click', function() {
        //     this.#game.view.resizeBy(2, 0);
        //     updateView();
        // });

        this.toggleEditorButton.addEventListener('click', this.#controller);
    }

    #addAdditionalEventListeners() {
        this.toggleGridCheckbox.addEventListener('change', this.#controller);
        this.toggleMaxViewCheckbox.addEventListener('change', this.#controller);
    }

    // toggleGridCheckbox.addEventListener('change', function() {
    toggleGrid(isEnabled) {
        const bodyClasses = document.body.classList;
        const editClass = 'edit-mode';
        if (isEnabled) {
            bodyClasses.add(editClass);
        } else {
            bodyClasses.remove(editClass);
        }
    }
    
    #createCheckboxInside(container, id, label) {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = id;
        container.appendChild(checkbox);
        const checkboxLabel = document.createElement('label');
        checkboxLabel.htmlFor = checkbox.id;
        checkboxLabel.textContent = label;
        container.appendChild(checkboxLabel);
    
        return checkbox;
    }

    #initializeEditor(buttonText) {
        this.toggleEditorButton.textContent = buttonText;
    
        this.#controlsContainer = document.createElement('div');
        this.toggleEditorButton.after(this.#controlsContainer);
        this.toggleGridCheckbox = this.#createCheckboxInside(this.#controlsContainer, 'toggle-grid', 'Grid');
        this.toggleMaxViewCheckbox = this.#createCheckboxInside(this.#controlsContainer, 'toggle-max-view', 'Show whole map');

        this.#addAdditionalEventListeners();
    
        //togglegrid
        //togglemax
    }
    
    // toggleEditorButton.addEventListener('click', function() {
    toggleEditor() {
        const toggleEditorButtonEnabledText = 'Disable Edit Mode';
        // If we're editing now or have ever been, just toggle control visibility
        if (this.#controlsContainer) {
            if (this.#controlsContainer.style.display === 'none') {
                this.#controlsContainer.style.display = 'block';
                this.toggleEditorButton.textContent = toggleEditorButtonEnabledText;
            } else {
                this.#controlsContainer.style.display = 'none'
                this.toggleEditorButton.textContent = 'Enable Edit Mode';
            }
        } else {
            // If this is our first time entering edit mode, set up controls
            this.#initializeEditor(toggleEditorButtonEnabledText);
        }
    }
}

// MVC's controller
class MapEditorController {
    #model;
    html;
    
    constructor(model) {
        // #addEventListeners();
        this.#model = model;
    }

    // #addEventListeners() {
    //     document.addEventListener('keydown', this.inputController);
    // }

    handleEvent(event) {
        // switch (event.target.id) {
        //     case 'decrease-view-height':
        //         this.#model.decreaseView();
        // }
        
        // const decreaseViewHeightButton = document.getElementById('decrease-view-height');
        // switch (event.target) {
        //     case decreaseViewHeightButton:
        //         this.#model.decreaseView();
        // }
        switch (event.target) {
            case this.html.decreaseViewHeightButton:
                this.#model.decreaseViewHeight();
                break;
            case this.html.increaseViewHeightButton:
                this.#model.increaseViewHeight();
                break;
            case this.html.decreaseViewWidthButton:
                this.#model.decreaseViewWidth();
                break;
            case this.html.increaseViewWidthButton:
                this.#model.increaseViewWidth();
                break;
            case this.html.toggleEditorButton:
                this.html.toggleEditor();
                break;
            case this.html.toggleGridCheckbox:
                this.html.toggleGrid(this.html.toggleGridCheckbox.checked);
                break;
            case this.html.toggleMaxViewCheckbox:
                // this.html.toggleMaxView(this.html.toggleMaxViewCheckbox);
                this.#model.toggleMaxView(this.html.toggleMaxViewCheckbox.checked);
                break;
        }
    }
}

import { Coordinate } from './GameMap.js';

// MVC's model
export default class MapEditor {
    #html;
    #controller;

    #game;

    #oldViewWidth;
    #oldViewHeight;
    #oldPlayerPosition;
    
    constructor(game) {
        this.#game = game;
        this.#controller = new MapEditorController(this);
        this.#html = new MapEditorHtml(this.#controller);
        // this.#controller.html = this.#html;

        this.#oldViewWidth = this.#game.view.width;
        this.#oldViewHeight = this.#game.view.height;
    }

    #updateView() {
        this.#game.view.update(this.#game.player, this.#game.remotePlayers);
    }

    #resizeViewBy(x = 0, y = 0) {
        this.#game.view.resizeBy(x, y);
        this.#updateView();
    }

    decreaseViewHeight() { this.#resizeViewBy(0, -2); }
    increaseViewHeight() { this.#resizeViewBy(0, 2); }
    decreaseViewWidth() { this.#resizeViewBy(-2); }
    increaseViewWidth() { this.#resizeViewBy(2); }
    
    // mapEditor.controller.handleInput = (someKindaInput) => {
        
    // }
    
    // TODO: Don't show any buttons until load is complete
    // - this class should be generating them anyway, not statically written into index.html

    // toggleMaxViewCheckbox.addEventListener('change', function() {
    toggleMaxView(isBecomingMaxView) {
        let newWidth = this.#oldViewWidth;
        let newHeight = this.#oldViewHeight;
        
        if (isBecomingMaxView) {
            // TODO: Deal with even dimensions more gracefully
            // -(currently does +1 to dimension, but visually unclear to user)
            newWidth = this.#game.view.map.width;
            newHeight = this.#game.view.map.height;
        }
        this.#game.view.resizeTo(newWidth, newHeight);

        // const isBecomingMaxView = isEnabled;
        // Don't allow player movement when map is full size
        this.#game.toggleInput(!isBecomingMaxView);
        if (isBecomingMaxView) {
            // WARN: If clicked before game is fully loaded, player.position will (probably) be undefined!
            this.#oldPlayerPosition = Coordinate.fromJson(this.#game.player.position.toJson());
            this.#game.player.move(this.#game.view.staticCenter);
        } else {
            this.#game.player.move(this.#oldPlayerPosition);
        }
        this.#game.player.surroundings.update(this.#game.player.position, this.#game.view.map);
        // NOTE: Does not change on server/refresh as we haven't called socket.broadcastMove()...
        
        this.#updateView();
    }
}