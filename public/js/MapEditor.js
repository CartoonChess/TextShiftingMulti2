// FIXME: This basically needs to return every tile in the z stack
const fakeLayer = 0;

import '../../Element_prototype.js';

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

    #mapControlsContainer;
    toggleGridCheckbox;
    toggleMaxViewCheckbox;

    #infoContainer;

    mapNameDropdown;
    updateMapNameButton;
    createMapButton;
    deleteMapButton;
    saveMapButton;

    #tileControlsContainer;
    #coordinatesTextContainer;
    #lineCoordinateText;
    #columnCoordinateText;
    tileSymbolDropdown;
    toggleTileIsSolidCheckbox;

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

    // TODO: Make #addClickEventListners() etc. like in controller class
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
            this.mapNameDropdown,
            this.tileSymbolDropdown,
            this.toggleTileIsSolidCheckbox
        ]
        
        for (const input of inputs) {
            input.addEventListener('change', this.#controller);
        }

        const buttons = [
            this.createMapButton,
            this.saveMapButton,
            this.increaseMapWidthOnRightButton,
            this.decreaseMapWidthOnRightButton,
            this.increaseMapHeightOnBottomButton,
            this.decreaseMapHeightOnBottomButton
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

    #createTextboxInside(container, id, text) {
        const textbox = document.createElement('input');
        textbox.id = id;
        textbox.type = 'text';
        textbox.value = text;
        container.appendChild(textbox);
    
        return textbox;
    }

    #createOptionInside(dropdown, text, before = null) {
        const option = document.createElement('option');
        option.text = text;
        option.value = text;
        dropdown.add(option, before);
    
        return option;
    }

    #updateTileSymbolDropdown(tile) {
        for (const option of this.tileSymbolDropdown.options) {
            if (option.value === tile.symbol) {
                option.selected = true;
                return;
            }
        }
        
        // Add symbol if not already in dropbox
        const newOption = this.#createOptionInside(this.tileSymbolDropdown, tile.symbol);
        newOption.selected = true;
    }

    #updateCoordinatesText(coordinate) {
        this.#columnCoordinateText.textContent = coordinate.column;
        this.#lineCoordinateText.textContent = coordinate.line;
    }

    updateTileControls(tile, coordinate) {
        // Don't do anything if not visible
        if (!this.#mapControlsContainer || this.#mapControlsContainer.style.display === 'none') { return; }
        // Hide if no tile selected
        if (!tile) { this.#tileControlsContainer.hide(); return; }

        this.#tileControlsContainer.show();
        
        // Update individual controls
        this.#updateCoordinatesText(coordinate);
        this.#updateTileSymbolDropdown(tile);
        this.toggleTileIsSolidCheckbox.checked = tile.isSolid;
    }

    #createTileSymbolDropdown() {
        this.tileSymbolDropdown = document.createElement('select');
        this.tileSymbolDropdown.id = 'tile-symbol';

        const symbols = [
            ' ',
            '.',
            '#'
        ];
        
        for (const symbol of symbols) {
            this.#createOptionInside(this.tileSymbolDropdown, symbol);
        }
    
        this.#tileControlsContainer.appendChild(this.tileSymbolDropdown);
    }

    // TODO: Not like this
    #createCoordinatesText() {
        this.#coordinatesTextContainer = document.createElement('div');
        this.#tileControlsContainer.appendChild(this.#coordinatesTextContainer);

        this.#columnCoordinateText = document.createElement('span');
        this.#columnCoordinateText.id = 'tile-x-coordinate';
        this.#lineCoordinateText = document.createElement('span');
        this.#lineCoordinateText.id = 'tile-y-coordinate';

        this.#coordinatesTextContainer.textContent = '(';
        this.#coordinatesTextContainer.appendChild(this.#columnCoordinateText);
        this.#coordinatesTextContainer.appendChild(document.createTextNode(','));
        this.#coordinatesTextContainer.appendChild(this.#lineCoordinateText);
        this.#coordinatesTextContainer.appendChild(document.createTextNode(')'));
    }

    #createTileControls() {
        // Coordinates
        this.#createCoordinatesText();

        // TODO: Maybe dropdown with "enter new" option that transforms into textbox, like map rename is supposed to do
        this.#createTileSymbolDropdown();

        this.toggleTileIsSolidCheckbox = this.#createCheckboxInside(this.#tileControlsContainer, 'toggle-tile-solid', 'Solid');

        // TODO: Scripts i.e. warp
        // - Maybe a checkbox (or just blank entry in dropdown for laziness) followed by same map dropdown
        // - Could also create a new map (in background) for later
    }

    #createTileControlsContainer(tile) {
        this.#tileControlsContainer = document.createElement('div');
        // Tile controls will appear under view/map
        this.#controller.viewHtml.after(this.#tileControlsContainer);
        this.#createTileControls();

        // Only show if map editor is visible
        this.#tileControlsContainer.hide();
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
            // this.mapNameDropdown.appendChild(option);
            this.mapNameDropdown.add(option);
    
            // Remove pre-await map name and highlight identical replacement in list
            // TODO: Isn't this actually useless? We should just .add(option, [before...]) until we get to current and then append the rest
            // - Or remove the old one and add them all, just .selected=true the current map when we go by in the loop
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
        this.updateMapNameButton.disabled = true;
        this.deleteMapButton = this.#createButtonInside(this.#infoContainer, 'delete-map', 'Delete');
        this.deleteMapButton.disabled = true;
        // TODO: Make this automatic
        this.saveMapButton = this.#createButtonInside(this.#infoContainer, 'save-map', 'Save');

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
        this.mapWidthTextbox = this.#createTextboxInside(this.#infoContainer, 'map-width', this.#mapWidth);
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
        this.mapHeightTextbox = this.#createTextboxInside(this.#infoContainer, 'map-height', this.#mapHeight);
        // Bottom buttons
        this.#infoContainer.appendChild(document.createElement('br'));
        this.decreaseMapHeightOnBottomButton = this.#createMapDimensionButton('-', 'y', 'b', up);
        this.increaseMapHeightOnBottomButton = this.#createMapDimensionButton('+', 'y', 'b', dn);

        // TODO: Remove someday
        this.increaseMapWidthOnLeftButton.disabled = true;
        this.decreaseMapWidthOnLeftButton.disabled = true;
        this.increaseMapHeightOnTopButton.disabled = true;
        this.decreaseMapHeightOnTopButton.disabled = true;
        
        // Depth
        this.#infoContainer.appendChild(document.createElement('hr'));
        // TODO: Buttons
        // Numerical size
        this.mapDepthTextbox = this.#createTextboxInside(this.#infoContainer, 'map-depth', this.#mapDepth);
        this.mapDepthTextbox.disabled = true;
    }

    updateMapDimensionTextboxes() {
        this.mapWidthTextbox.value = this.#mapWidth;
        this.mapHeightTextbox.value = this.#mapHeight;
        this.mapDepthTextbox.value = this.#mapDepth;
    }

    #updateMapNameDropdown() {
        for (const option of this.mapNameDropdown.options) {
            if (option.value === this.#mapName) {
                option.selected = true;
                return;
            }
        }
        
        // Add map if we couldn't find it in the list
        const newOption = document.createElement('option');
        newOption.text = this.#mapName;
        newOption.value = newOption.text;

        // Place in correct order in hierarchy
        let nextOption = null;
        for (const option of this.mapNameDropdown.options) {
            if (option.text > newOption.text) {
                nextOption = option;
                break;
            }
        }
        this.mapNameDropdown.add(newOption, nextOption);
        newOption.selected = true;
    }

    // TODO: This logic should probably be removed from the creation methods
    updateMapControls() {
        // Don't try to update anything if we've never opened the editor
        if (!this.#infoContainer) { return; }

        this.#updateMapNameDropdown();
        this.updateMapDimensionTextboxes();
        
    }

    async #createInfoContainer() {
        this.#infoContainer = document.createElement('div');
        // document.getElementById('game-view').before(this.#infoContainer);
        this.#controller.viewHtml.before(this.#infoContainer);
        
        // Map name and location (directory)
        await this.#createMapNameControls();

        // Map size
        this.#createMapDimensionControls();
    }

    async #initializeEditor(buttonText) {
        this.toggleEditorButton.textContent = buttonText;
        
        // TODO: probably break this block into its own func
        this.#mapControlsContainer = document.createElement('div'); 
        this.toggleEditorButton.after(this.#mapControlsContainer);
        this.toggleGridCheckbox = this.#createCheckboxInside(this.#mapControlsContainer, 'toggle-grid', 'Grid');
        this.toggleMaxViewCheckbox = this.#createCheckboxInside(this.#mapControlsContainer, 'toggle-max-view', 'Show whole map');
        
        await this.#createInfoContainer();
        this.#createTileControlsContainer();

        this.#addAdditionalEventListeners();
    }
    
    async toggleEditor() {
        const toggleEditorButtonEnabledText = 'Disable Edit Mode';
        // Only some controls are shown when first entering edit mode
        const startContainers = [
            this.#mapControlsContainer,
            this.#infoContainer
        ];
        const allContainers = [this.#tileControlsContainer, ...startContainers];
        // If we're editing now or have ever been, just toggle control visibility
        if (this.#mapControlsContainer) {
            if (this.#mapControlsContainer.style.display === 'none') {
                for (const container of startContainers) { container.show(); }
                this.toggleEditorButton.textContent = toggleEditorButtonEnabledText;
            } else {
                for (const container of allContainers) { container.hide(); }
                this.toggleEditorButton.textContent = 'Enable Edit Mode';
            }
        } else {
            // If this is our first time entering edit mode, set up controls
            await this.#initializeEditor(toggleEditorButtonEnabledText);
        }
    }
}


import { Direction } from './Direction.js';
import { RandomBytes } from '../../randomBytes.js';
const randomBytes = new RandomBytes();
const randomName = () => randomBytes.alphanumeric(8);

// MVC's controller
// TODO: Right now this is instantiated as soon as index.js loads.
// - Instead, it should happen after clicking the Map Editor button.
export default class MapEditor {
    #model;
    #html;

    #selectedTileMapCoordinate;
    
    constructor(game) {
        // Listen for map changes
        game.addListener(this);

        this.#model = new MapEditorModel(game);
        this.#html = new MapEditorHtml(this);

        // Listen for clicks on tiles
        // Must come after intializing model!
        this.#addClickEventListeners();
    }

    #didClickViewTile(tile) {
        const lineHtml = tile.parentElement;
        const layerHtml = lineHtml.parentElement;

        const column = Array.from(lineHtml.querySelectorAll('span')).indexOf(tile);
        const line = Array.from(layerHtml.querySelectorAll('pre')).indexOf(lineHtml);
        // This would presumably always result in the uppermost layer
        // const layer = Array.from(this.#model.viewHtml.children).indexOf(layerHtml);

        // TODO: Shorten logic for when using "show whole map"
        // - view coords and map coords should be identical

        this.#selectedTileMapCoordinate = this.#model.getMapCoordinateForViewCoordinate(column, line);
        this.#selectedTileMapCoordinate.layer = fakeLayer;
        this.#html.updateTileControls(this.#model.getTileAtCoordinate(this.#selectedTileMapCoordinate), this.#selectedTileMapCoordinate);
    }

    #addEventListeners(elements, eventType) {
        for (const element of elements) {
            element.addEventListener(eventType, this);
        }
    }

    #addClickEventListeners() {
        this.#addEventListeners([
            this.#model.viewHtml
        ], 'click');
    }

    async handleEvent(event) {
        // Check if user clicked a map tile
        if (event.target.tagName === 'SPAN' && event.target.closest('#' + this.#model.viewHtml.id)) {
            this.#didClickViewTile(event.target);
            return;
        }

        switch (event.target) {
            case this.#html.decreaseViewHeightButton:
                this.#model.decreaseViewHeight();
                break;
            case this.#html.increaseViewHeightButton:
                this.#model.increaseViewHeight();
                break;
            case this.#html.decreaseViewWidthButton:
                this.#model.decreaseViewWidth();
                break;
            case this.#html.increaseViewWidthButton:
                this.#model.increaseViewWidth();
                break;
            case this.#html.toggleEditorButton:
                await this.#html.toggleEditor();
                break;
            case this.#html.toggleGridCheckbox:
                this.#html.toggleGrid(this.#html.toggleGridCheckbox.checked);
                break;
            case this.#html.toggleMaxViewCheckbox:
                this.#model.toggleMaxView(this.#html.toggleMaxViewCheckbox.checked);
                break;
            case this.#html.mapNameDropdown:
                await this.#model.changeMap(this.#html.mapNameDropdown.value);
                break;
            case this.#html.createMapButton:
                await this.#createMap();
                break;
            case this.#html.saveMapButton:
                await this.#model.saveMap();
                break;
            case this.#html.increaseMapWidthOnRightButton:
                this.#model.updateMapSize(Direction.Right, 1);
                this.#html.updateMapDimensionTextboxes();
                break;
            case this.#html.decreaseMapWidthOnRightButton:
                this.#model.updateMapSize(Direction.Right, -1);
                this.#html.updateMapDimensionTextboxes();
                break;
            case this.#html.increaseMapHeightOnBottomButton:
                this.#model.updateMapSize(Direction.Down, 1);
                this.#html.updateMapDimensionTextboxes();
                break;
            case this.#html.decreaseMapHeightOnBottomButton:
                this.#model.updateMapSize(Direction.Down, -1);
                this.#html.updateMapDimensionTextboxes();
                break;
            case this.#html.tileSymbolDropdown:
                this.#model.updateTile(this.#selectedTileMapCoordinate, 'symbol', this.#html.tileSymbolDropdown.value);
                break;
            case this.#html.toggleTileIsSolidCheckbox:
                // TODO: We should probably sanity check selectedTileMapCoordinate
                this.#model.updateTile(this.#selectedTileMapCoordinate, 'isSolid', this.#html.toggleTileIsSolidCheckbox.checked);
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

    get viewHtml() {
        return this.#model.viewHtml;
    }

    async #createMap() {
        // NOTE: Currently bypassing below
        return this.#createMapFromTemplate();
    }

    async #createMapFromTemplate() {
        // Get parent directory of current map (new map will be a "sibling")
        const pathParts = this.#model.mapName.split('/');
        pathParts.pop();
        const parentDir = pathParts.join('/');

        const query = '?' + new URLSearchParams({ parentDir: parentDir }).toString();

        try {
            const response = await fetch('/createMapFromTemplate' + query);

            if (!response.ok) {
                const err = await response.text();
                throw new Error(err);
            }

            const newMap = await response.text();
            console.log(newMap);

            // Update Game etc. with new map
            await this.#model.changeMap(newMap);
        } catch (err) {
            console.error(err.message);
        }
    }

    // Observe a notification, as a listener
    // Currently this is exclusively for map changes
    listen() {
        this.#html.updateMapControls();
        // Clear selected tile
        this.#selectedTileMapCoordinate = null;
        this.#html.updateTileControls(this.#selectedTileMapCoordinate);
    }
}


import { Coordinate } from './GameMap.js';
import Tile from './Tile.js';
import '../JSON_stringifyWithClasses.js';

// MVC's model
class MapEditorModel {
    #game;

    #oldViewWidth;
    #oldViewHeight;
    #oldPlayerPosition;
    
    constructor(game) {
        this.#game = game;
        // this.#game.addListener(this);

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

    get viewHtml() {
        return this.#game.view.htmlById;
    }

    updateMapName(name) {
        // TODO: Implement
    }

    getTileAtCoordinate(coordinate) {
        // if (!this.#game.view.tileIsInBounds(coordinate.column, coordinate.line, coordinate.layer)) { return; }
        // return this.#game.view.getTile(coordinate.column, coordinate.line, coordinate.layer);
        return this.#game.view.getTile(coordinate.column, coordinate.line, coordinate.layer, false);
    }

    getMapCoordinateForViewCoordinate(viewColumn, viewLine) {
        const columnOffset = viewColumn - this.#game.view.staticCenter.column;
        const lineOffset = viewLine - this.#game.view.staticCenter.line;

        const mapColumn = this.#game.view.mapCoordinateAtViewCenter.column + columnOffset;
        const mapLine = this.#game.view.mapCoordinateAtViewCenter.line + lineOffset;

        return new Coordinate(mapColumn, mapLine);
    }

    updateTile(coordinate, property, value) {
        const tile = this.#game.view.map.lines[coordinate.layer][coordinate.line][coordinate.column];
        tile[property] = value;
        this.#updateView();
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

    #addTilesToLine(line, amount) {
        for (let i = 0; i < amount; i++) {
            line.push(new Tile());
        }
        return line;
    }

    #increaseMapSizeOnBottom(amount) {
        const layers = this.#game.view.map.lines;

        let line = [];
        line = this.#addTilesToLine(line, this.mapWidth);

        for (const layer of layers) {
            for (let i = 0; i < amount; i++) {
                layer.push(line);
            }
        }
    }

    #decreaseMapSizeOnBottom(amount) {
        const layers = this.#game.view.map.lines;

        for (const layer of layers) {
            layer.splice(amount);
        }
    }

    #increaseMapSizeOnRight(amount) {
        const layers = this.#game.view.map.lines;
        for (const layer of layers) {
            for (let line of layer) {
                // Linter complains, but this seems necessary...
                line = this.#addTilesToLine(line, amount);
            }
        }
    }

    #decreaseMapSizeOnRight(amount) {
        const layers = this.#game.view.map.lines;
        for (const layer of layers) {
            for (let line of layer) {
                line.splice(amount);
            }
        }
    }

    updateMapSize(side, amount) {
        const absAmount = Math.abs(amount);
        const willGrow = amount > 0;
        switch (side) {
            case Direction.Up: {
                // TODO: willGrow -> layer.unshift(line, line) (adds new index 0..., shifts everything else up)
                // TODO: !willGrow -> layer.shift() (removes layer[0])
                // WARN: This func breaks all coord refs line warp tiles
                break;
            }
            case Direction.Down: {
                if (willGrow) {
                    this.#increaseMapSizeOnBottom(amount);
                } else {
                    if (this.mapHeight - absAmount <= 0) { return; }
                    this.#decreaseMapSizeOnBottom(amount);
                }
                this.#game.view.map.height += amount;
                break;
            }
            case Direction.Left: {
                break;
            }
            case Direction.Right: {
                if (willGrow) {
                    this.#increaseMapSizeOnRight(absAmount);
                } else {
                    if (this.mapWidth - absAmount <= 0) { return; }
                    this.#decreaseMapSizeOnRight(amount);
                }
                this.#game.view.map.width += amount;
                break;
            }
            default: {
                console.warn(`Don't use Direction.Here when calling MapEditorModel.updateMapSize().`);
            }
        }

        this.#updateView();
    }

    // #deleteMap() {

    // }

    async changeMap(map) {
        await this.#game.changeMap(map);
        this.#updateView();
        // socket.broadcastMove();
        // - or should this be in #updateView()?
    }

    async saveMap() {
        try {
            // const response = await fetch('/updateMap', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //         name: this.mapName,
            //         tiles: this.#game.view.map.lines
            //     })
            // });
            const response = await fetch('/updateMap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringifyWithClasses({
                    name: this.mapName,
                    tiles: this.#game.view.map.lines
                })
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