// MVC's view
class MapEditorHtml {
    // TODO: Don't show any buttons until load is complete
    #controller;

    #mapName;
    
    decreaseViewHeightButton = document.getElementById('decrease-view-height');
    increaseViewHeightButton = document.getElementById('increase-view-height');
    decreaseViewWidthButton = document.getElementById('decrease-view-width');
    increaseViewWidthButton = document.getElementById('increase-view-width');

    toggleEditorButton = document.getElementById('toggle-editor');

    #controlsContainer;
    toggleGridCheckbox;
    toggleMaxViewCheckbox;

    #infoContainer;
    mapNameTextbox;
    
    constructor(mapName, controller) {
        this.#controller = controller;
        // this.#controller.html = this;
        this.#mapName = mapName;
        this.#addEventListeners();
    }

    #addEventListeners() {
        const buttons = [
            this.decreaseViewHeightButton,
            this.increaseViewHeightButton,
            this.decreaseViewWidthButton,
            this.increaseViewWidthButton,
            this.toggleEditorButton
        ]

        for (const button of buttons) {
            button.addEventListener('click', this.#controller);
        }
    }

    #addAdditionalEventListeners() {
        // TODO: Integrate with above once everything is programmatic
        const inputs = [
            this.toggleGridCheckbox,
            this.toggleMaxViewCheckbox,
            this.mapNameTextbox
        ]

        for (const input of inputs) {
            input.addEventListener('change', this.#controller);
        }
    }

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

    #createInfoContainer() {
        this.#infoContainer = document.createElement('div');
        document.getElementById('game-view').before(this.#infoContainer);

        
        // Location (directory)
        // TODO: Implement (see notes for ideas)

        // Map name
        const mapNameText = this.#mapName;
        this.mapNameTextbox = document.createElement('input');
        this.mapNameTextbox.id = 'map-name';
        this.mapNameTextbox.type = 'text';
        this.mapNameTextbox.value = mapNameText;
        this.#infoContainer.appendChild(this.mapNameTextbox);

        // Map dimensions
        // TODO: textboxes? dropdowns?? +/- buttons..? maybe textbox + buttons...
    }

    #initializeEditor(buttonText) {
        this.toggleEditorButton.textContent = buttonText;
        
        // TODO: probably break this block into its own func
        this.#controlsContainer = document.createElement('div');
        this.toggleEditorButton.after(this.#controlsContainer);
        this.toggleGridCheckbox = this.#createCheckboxInside(this.#controlsContainer, 'toggle-grid', 'Grid');
        this.toggleMaxViewCheckbox = this.#createCheckboxInside(this.#controlsContainer, 'toggle-max-view', 'Show whole map');
        
        this.#createInfoContainer();

        this.#addAdditionalEventListeners();
    }
    
    toggleEditor() {
        const toggleEditorButtonEnabledText = 'Disable Edit Mode';
        // If we're editing now or have ever been, just toggle control visibility
        if (this.#controlsContainer) {
            if (this.#controlsContainer.style.display === 'none') {
                this.#controlsContainer.style.display = 'block';
                this.#infoContainer.style.display = 'block';
                this.toggleEditorButton.textContent = toggleEditorButtonEnabledText;
            } else {
                this.#controlsContainer.style.display = 'none'
                this.#infoContainer.style.display = 'none';
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
    // #html;
    
    constructor(model) {
        this.#model = model;
        // this.#html = new MapEditorHtml(this);
        this.html = new MapEditorHtml(this.#model.mapName, this);
    }

    handleEvent(event) {
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
                this.#model.toggleMaxView(this.html.toggleMaxViewCheckbox.checked);
                break;
            case this.html.mapNameTextbox:
                this.#model.updateMapName(this.html.mapNameTextbox.value);
                break;
        }
    }
}


import { Coordinate } from './GameMap.js';

// MVC's model
export default class MapEditor {
    // #html;
    // #controller;

    #game;

    #oldViewWidth;
    #oldViewHeight;
    #oldPlayerPosition;
    
    constructor(game) {
        this.#game = game;
        // this.#controller = new MapEditorController(this);
        new MapEditorController(this);
        // this.#html = new MapEditorHtml(this.#controller);
        // this.#controller.html = this.#html;

        this.#oldViewWidth = this.#game.view.width;
        this.#oldViewHeight = this.#game.view.height;
    }

    get mapName() {
        return this.#game.view.map.name;
    }

    updateMapName(name) {
        // TODO: Implement
        console.debug(name);
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