// MVC's view
class MapEditorHtml {
    // TODO: Don't show any buttons until load is complete
    #controller;

    // #mapName;
    
    decreaseViewHeightButton = document.getElementById('decrease-view-height');
    increaseViewHeightButton = document.getElementById('increase-view-height');
    decreaseViewWidthButton = document.getElementById('decrease-view-width');
    increaseViewWidthButton = document.getElementById('increase-view-width');

    toggleEditorButton = document.getElementById('toggle-editor');

    #controlsContainer;
    toggleGridCheckbox;
    toggleMaxViewCheckbox;

    #infoContainer;

    mapNameDropdown;
    updateMapNameButton;
    createMapButton;
    deleteMapButton;

    increaseMapWidthOnLeftButton;
    decreaseMapWidthOnLeftButton;
    increaseMapWidthOnRightButton;
    decreaseMapWidthOnRightButton;
    increaseMapHeightOnTopButton;
    decreaseMapHeightOnTopButton;
    increaseMapHeightOnBottomButton;
    decreaseMapHeightOnBottomButton;
    mapWidthTextbox;
    mapHeightTextbox;
    mapDepthTextbox;
    
    // constructor(mapName, controller) {
    constructor(controller) {
        this.#controller = controller;
        // this.#controller.html = this;
        // this.#mapName = mapName;
        this.#addEventListeners();
    }

    get #mapName() {
        return this.#controller.mapName;
    }

    get #mapWidth() {
        return this.#controller.mapWidth;
    }

    get #mapHeight() {
        return this.#controller.mapHeight;
    }

    get #mapDepth() {
        return this.#controller.mapDepth;
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
        // Note that mapNameDropdown isn't actually `input` but `select` (rename to `elements`?)
        const inputs = [
            this.toggleGridCheckbox,
            this.toggleMaxViewCheckbox,
            this.mapNameDropdown
        ]
        
        for (const input of inputs) {
            input.addEventListener('change', this.#controller);
        }

        const buttons = [
            this.createMapButton
        ]

        for (const button of buttons) {
            button.addEventListener('click', this.#controller);
        }

        // TODO: Do we want mapNameDropdown to trigger on change or on input? Seems fine for now...
        // this.mapNameDropdown.addEventListener('input', this.#controller);
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

    #createButtonInside(container, id, text) {
        const button = document.createElement('button');
        button.id = id;
        button.textContent = text;
        container.appendChild(button);
    
        return button;
    }

    #creatTextboxInside(container, id, text) {
        const textbox = document.createElement('input');
        textbox.id = id;
        textbox.type = 'text';
        textbox.value = text;
        container.appendChild(textbox);
    
        return textbox;
    }

    async #createMapNameControls() {
        // Create disabled dropdown showing map name
        this.mapNameDropdown = document.createElement('select');
        this.mapNameDropdown.id = 'map-name';
        this.mapNameDropdown.disabled = true;
    
        const option = document.createElement('option');
        option.text = this.#mapName;
        option.value = option.text;
        this.mapNameDropdown.add(option);
    
        this.#infoContainer.appendChild(this.mapNameDropdown);
    
        // Populate with full map list when available
        const mapList = await this.#controller.getDirectoryListing();
        let didFindCurrentMap = false;
    
        for (const map of mapList) {
            const option = document.createElement('option');
            option.text = map;
            option.value = option.text;
            this.mapNameDropdown.appendChild(option);
    
            // Remove pre-await map name and highlight identical replacement in list
            if (!didFindCurrentMap && map === this.#mapName) {
                this.mapNameDropdown.options[0].remove();
                option.selected = true;
                didFindCurrentMap = true;
            }
        }
    
        // Make it clickable
        this.mapNameDropdown.disabled = false;
        
        // TODO: Dropdown becomes a textbox when renaming
        // Map name
        // const mapNameText = this.#mapName;
        // this.mapNameTextbox = document.createElement('input');
        // this.mapNameTextbox.id = 'map-name';
        // this.mapNameTextbox.type = 'text';
        // this.mapNameTextbox.value = mapNameText;
        // this.#infoContainer.appendChild(this.mapNameTextbox);
    
        // TODO: Make these work
        this.updateMapNameButton = this.#createButtonInside(this.#infoContainer, 'update-map-name', 'Rename/Move');
        this.deleteMapButton = this.#createButtonInside(this.#infoContainer, 'delete-map', 'Delete');
        this.createMapButton = this.#createButtonInside(this.#infoContainer, 'create-map', 'New');
    }

    #getDimensionButtonId(change, axis, side) {
        if ((change != '+' && change != '-')
            || (axis != 'x' && axis != 'y')
            || (side != 'l' && side != 'r' && side != 't' && side != 'b')) {
                return console.error('Illegal argument passed to MapEditorHtml.#getButtonName().');
            }
    
        const changeText = change == '+' ? 'increase' : 'decrease';
        const axisText = axis == 'x' ? 'width' : 'height';
        let sideText = '';
        switch (side) {
            case 'l': { sideText = 'left'; break; }
            case 'r': { sideText = 'right'; break; }
            case 't': { sideText = 'top'; break; }
            case 'b': { sideText = 'bottom'; break; }
            default: {
                console.error('MapEditorHtml.#getButtonName() default case was triggered (should never happen).');
            }
        }

        return `${changeText}-map-${axisText}-on-${sideText}-button`;
    }

    #createMapDimensionButton(change, axis, side, symbol) {
        return this.#createButtonInside(this.#infoContainer, this.#getDimensionButtonId(change, axis, side), symbol);
    }

    #createMapDimensionControls() {
        const lt = '<';
        const rt = '>';
        const up = '^';
        const dn = 'v';

        // TODO: Currently there's no way to know where add/sub will happen if changing textbox number
        // - Maybe after changing the number, you have to click one of the buttons to make it happen...

        // Width
        this.#infoContainer.appendChild(document.createElement('hr'));
        // Leftside buttons
        this.increaseMapWidthOnLeftButton = this.#createMapDimensionButton('+', 'x', 'l', lt);
        this.decreaseMapWidthOnLeftButton = this.#createMapDimensionButton('-', 'x', 'l', rt);
        // Numerical size
        this.mapWidthTextbox = this.#creatTextboxInside(this.#infoContainer, 'map-width', this.#mapWidth);
        // Rightside buttons
        this.decreaseMapWidthOnRightButton = this.#createMapDimensionButton('-', 'x', 'r', lt);
        this.increaseMapWidthOnRightButton = this.#createMapDimensionButton('+', 'x', 'r', rt);
        
        // Height
        // Top buttons
        this.#infoContainer.appendChild(document.createElement('hr'));
        this.increaseMapHeightOnTopButton = this.#createMapDimensionButton('+', 'y', 't', up);
        this.decreaseMapHeightOnTopButton = this.#createMapDimensionButton('-', 'y', 't', dn);
        // Numerical size
        this.#infoContainer.appendChild(document.createElement('br'));
        this.mapHeightTextbox = this.#creatTextboxInside(this.#infoContainer, 'map-height', this.#mapHeight);
        // Bottom buttons
        this.#infoContainer.appendChild(document.createElement('br'));
        this.decreaseMapHeightOnBottomButton = this.#createMapDimensionButton('-', 'y', 'b', up);
        this.increaseMapHeightOnBottomButton = this.#createMapDimensionButton('+', 'y', 'b', dn);

        // Depth
        this.#infoContainer.appendChild(document.createElement('hr'));
        // TODO: Buttons
        // Numerical size
        this.mapDepthTextbox = this.#creatTextboxInside(this.#infoContainer, 'map-depth', this.#mapDepth);
    }

    async #createInfoContainer() {
        this.#infoContainer = document.createElement('div');
        document.getElementById('game-view').before(this.#infoContainer);
        
        // Map name and location (directory)
        await this.#createMapNameControls();

        // Map size
        this.#createMapDimensionControls();
    }

    async #initializeEditor(buttonText) {
        this.toggleEditorButton.textContent = buttonText;
        
        // TODO: probably break this block into its own func
        this.#controlsContainer = document.createElement('div');
        this.toggleEditorButton.after(this.#controlsContainer);
        this.toggleGridCheckbox = this.#createCheckboxInside(this.#controlsContainer, 'toggle-grid', 'Grid');
        this.toggleMaxViewCheckbox = this.#createCheckboxInside(this.#controlsContainer, 'toggle-max-view', 'Show whole map');
        
        await this.#createInfoContainer();

        this.#addAdditionalEventListeners();
    }
    
    async toggleEditor() {
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
            await this.#initializeEditor(toggleEditorButtonEnabledText);
        }
    }
}


import { RandomBytes } from '/randomBytes.js';
const randomBytes = new RandomBytes();
const randomName = () => randomBytes.alphanumeric(8);

// MVC's controller
// class MapEditorController {
export default class MapEditor {
    #model;
    html;
    // #html;
    
    // constructor(model) {
    //     this.#model = model;
    constructor(game) {
        this.#model = new MapEditorModel(game);
        // this.#html = new MapEditorHtml(this);
        // this.html = new MapEditorHtml(this.#model.mapName, this);
        this.html = new MapEditorHtml(this);
    }

    async handleEvent(event) {
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
                await this.html.toggleEditor();
                break;
            case this.html.toggleGridCheckbox:
                this.html.toggleGrid(this.html.toggleGridCheckbox.checked);
                break;
            case this.html.toggleMaxViewCheckbox:
                this.#model.toggleMaxView(this.html.toggleMaxViewCheckbox.checked);
                break;
            case this.html.mapNameDropdown:
                this.#model.updateMapName(this.html.mapNameDropdown.value);
                break;
            case this.html.createMapButton:
                // this.#model.createMap();
                await this.#createMap();
                break;
        }
    }

    async getDirectoryListing() {
        return await this.#model.getDirectoryListing();
    }

    get mapName() {
        return this.#model.mapName;
    }

    get mapWidth() {
        return this.#model.mapWidth;
    }

    get mapHeight() {
        return this.#model.mapHeight;
    }

    get mapDepth() {
        return this.#model.mapDepth;
    }

    async #createMap() {
        // Create blank map one directory above current

        const shortName = randomName();
        // Create in parent folder, with leading slash
        const pathParts = this.#model.mapName.split('/');
        pathParts.pop();
        const fullName = pathParts.join('/') + '/' + shortName;

        // const data = {
        //     dir: fullName,
        //     file: 'info.js',
        //     content: `export const data = {
        //         "name": "${fullName}",
        //         "dimensions": {
        //             "width": 1,
        //             "height": 1,
        //             "depth": 1
        //         },
        //         "startPosition": {
        //             "column": 0,
        //             "line": 0
        //         }
        //     }`
        // };
        const data = {
            dir: fullName,
            info: `export const data = {
                "name": "${fullName}",
                "dimensions": {
                    "width": 1,
                    "height": 1,
                    "depth": 1
                },
                "startPosition": {
                    "column": 0,
                    "line": 0
                }
            }`,
            map: `export const tiles = ['map placeholder'];`,
            border: `// TODO: Use new border format`

        };

        try {
            const response = await fetch('/createMap', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const err = await response.text();
                throw new Error(err);
            }

            const responseText = await response.text();
            console.log(responseText);
        } catch (err) {
            console.error(err.message);
        }


        // Update Game etc. with new map
        // - this should basically be the same as when we're editing an existing map...
        // - ...except it isn't changing a "piece" of the working data, it's replacing the whole map that's in memory
        await this.#model.changeMap(fullName);
        // Reflect map stats in html
        // - should be same as first load of EditorView obj I guess?
        // - change to new name in dropdown
    }
}


import { Coordinate } from './GameMap.js';

// MVC's model
// export default class MapEditor {
class MapEditorModel {
    // #html;
    // #controller;

    #game;

    #oldViewWidth;
    #oldViewHeight;
    #oldPlayerPosition;
    
    constructor(game) {
        this.#game = game;
        // this.#controller = new MapEditorController(this);
        // new MapEditorController(this);
        // this.#html = new MapEditorHtml(this.#controller);
        // this.#controller.html = this.#html;

        this.#oldViewWidth = this.#game.view.width;
        this.#oldViewHeight = this.#game.view.height;

        // TODO: Figure out when to call this
        this.getDirectoryListing();
    }

    get mapName() {
        return this.#game.view.map.name;
    }

    get mapWidth() {
        return this.#game.view.map.width;
    }

    get mapHeight() {
        return this.#game.view.map.height;
    }

    get mapDepth() {
        return this.#game.view.map.depth;
    }

    updateMapName(name) {
        // TODO: Implement
    }

    // TODO: Maybe this should just be in the controller?
    async getDirectoryListing() {
        // Note that '/maps' corresponds to express's `.get` access point
        // TODO: This directory should be like a global constant
        const response = await fetch('/maps');
        if (response.ok) {
            return await response.json();
        } else {
            console.error('Could not fetch directory listing.');
        }
    }

    // #deleteMap() {

    // }

    async changeMap(map) {
        await this.#game.changeMap(map);
        // this.#updateView();
        // socket.broadcastMove();
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