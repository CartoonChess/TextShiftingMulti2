// FIXME: This basically needs to return every tile in the z stack
const fakeLayer = 0;

import '../../HTMLElement_prototype.js';

// MVC's view
class MapEditorHtml {
    // TODO: Don't show any buttons until load is complete
    #controller;

    decreaseViewHeightButton = document.getElementById('decrease-view-height');
    increaseViewHeightButton = document.getElementById('increase-view-height');
    decreaseViewWidthButton = document.getElementById('decrease-view-width');
    increaseViewWidthButton = document.getElementById('increase-view-width');

    toggleEditorButton = document.getElementById('toggle-editor');

    tileScriptContainerClass = 'tile-script';
    removeTileScriptButtonClass = 'remove-tile-script';

    scriptTileType = {
        warp: 'warp'
    };

    warpTileScriptColumnTextboxClass = 'warp-tile-script-column';
    warpTileScriptLineTextboxClass = 'warp-tile-script-line';

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
    #tileCoordinatesTextContainer;
    #lineCoordinateText;
    #columnCoordinateText;
    toggleCloneModeCheckbox
    tileSymbolDropdown;
    toggleTileIsSolidCheckbox;

    tileScriptsGroupContainer;
    tileScriptDropdown;

    #warpTileScriptContainer;
    warpTileScriptMapDropdown;
    warpTileScriptColumnTextbox;
    warpTileScriptLineTextbox;

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
        // Seems like we shouldn't add this.tileScriptDropdown explicitly
        // - otherwise it targets twice, presumably because of tileScriptsGroupContainer
        const inputs = [
            this.toggleGridCheckbox,
            this.toggleMaxViewCheckbox,
            this.mapNameDropdown,
            this.tileSymbolDropdown,
            this.toggleTileIsSolidCheckbox,
            // this.tileScriptsGroupContainer
        ]
        
        for (const input of inputs) {
            input.addEventListener('change', this.#controller);
        }

        // Add tileScriptsGroupContainer again, this time for buttons
        const buttons = [
            this.createMapButton,
            this.saveMapButton,
            this.increaseMapWidthOnRightButton,
            this.decreaseMapWidthOnRightButton,
            this.increaseMapHeightOnBottomButton,
            this.decreaseMapHeightOnBottomButton,
            // this.tileScriptsGroupContainer
        ]

        for (const button of buttons) {
            button.addEventListener('click', this.#controller);
        }

        // tileScriptsGroupContainer needs lots of different events handled
        // [[x change for dropdowns]], click for buttons, input for textboxes and dropdowns
        // const eventTypes = ['change', 'click', 'input'];
        const eventTypes = ['click', 'input'];
        for (const eventType of eventTypes) {
            this.tileScriptsGroupContainer.addEventListener(eventType, this.#controller);
        }
    }

    #addEventListenerOnChange(element) {
        element.addEventListener('change', this.#controller);
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

    #selectOption(value, selectElement) {
        const options = selectElement.options;
        for (const option of options) {
            if (option.value === value) {
                option.selected = true;
                return;
            }
        }
    }
    
    #createCheckboxInside(container, label, id) {
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

    #createButtonInside(container, text, id) {
        const button = document.createElement('button');
        button.id = id;
        button.textContent = text;
        container.appendChild(button);
    
        return button;
    }

    #createTextboxInside(container, text, id) {
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

    // `script` will be undefined if user is creating new; defined if loading from map data
    #createWarpTileScriptContainer(container, script) {
        // Column and line boxes
        const columnTextbox = this.#createTextboxInside(container, '0');
        columnTextbox.className = this.warpTileScriptColumnTextboxClass;
        const lineTextbox = this.#createTextboxInside(container, '0');
        lineTextbox.className = this.warpTileScriptLineTextboxClass;

        // Deep clone the map controls dropdown
        const warpMapDropdown = this.mapNameDropdown.cloneNode(true);
        warpMapDropdown.id = null;
        container.appendChild(warpMapDropdown);

        // Make the current map the default option
        // TODO: Make this safely wait for mapDropdown async population
        const currentMap = warpMapDropdown.options[this.mapNameDropdown.selectedIndex];
        currentMap.text = '(current map)';
        currentMap.value = '';
        currentMap.selected = true;

        // Populate with data if loading from existing script
        if (!script) { return; }

        columnTextbox.value = script.destinationCoordinate.column;
        lineTextbox.value = script.destinationCoordinate.line;

        if (script.destinationMap) {
            // TODO: Error handling for unknown map (maybe just... add it to the list?)
            this.#selectOption(script.destinationMap, warpMapDropdown);
        }
    }

    removeTileScriptContainer(container) {
        container.remove();
    }

    // Container for one single script
    // Unlike other creators, doesn't happen on editor load, only on tile click (existing script) or user creating new manually
    // `script` is passed when loading from map data (clicking tile), undefined when user adds new script
    createTileScriptContainer(script) {
        // Create div
        const container = document.createElement('div');
        container.className = this.tileScriptContainerClass;

        // Attach div to group container
        this.tileScriptsGroupContainer.appendChild(container);

        // Delete button
        const removeButton = this.#createButtonInside(container, '-');
        removeButton.className = this.removeTileScriptButtonClass;
        // Script type title label
        const title = document.createElement('span');
        container.appendChild(title);

        // Get the currently selected dropdown value, in case no script was passed (creating new)
        const dropdownValue = this.tileScriptDropdown.value;

        // Create from map data (script instanceof), or else creating new (from dropdown)
        switch (true) {
            case script instanceof WarpTileScript || dropdownValue === this.scriptTileType.warp:
                title.textContent = this.scriptTileType.warp;
                container.classList.add(this.scriptTileType.warp);
                this.#createWarpTileScriptContainer(container, script);
                break;
            default:
                console.warn(`Unknown TileScript type (${script?.constructor.name}) or dropdown value (${dropdownValue}).`);
        }

        // Reset creator dropdown
        this.tileScriptDropdown.options[0].selected = true;
    }

    // Automatically called when user clicks a tile
    // `scripts` is an array of TileScripts, or maybe undefined
    #updateTileScriptsGroupContainer(scripts) { 
        // Remove previously selected tile's script controls
        const oldScriptContainers = this.tileScriptsGroupContainer.querySelectorAll('.tile-script');
        for (const container of oldScriptContainers) {
            container.remove();
        }

        if (!scripts) { return; }

        // Create and show controls for each script
        for (const script of scripts) {
            this.createTileScriptContainer(script);
        }
    }

    #updateTileSymbolDropdown(tile) {
        // TODO: Use this.#selectOption(...)
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

    #updateTileCoordinatesText(coordinate) {
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
        this.#updateTileCoordinatesText(coordinate);
        this.#updateTileSymbolDropdown(tile);
        this.toggleTileIsSolidCheckbox.checked = tile.isSolid;
        this.#updateTileScriptsGroupContainer(tile.scripts);
    }

    // General container with header containing all other individual script containers if present
    #createTileScriptsGroupContainer() {
        this.tileScriptsGroupContainer = document.createElement('div');

        this.tileScriptsGroupContainer.appendChild(document.createElement('hr')); // or upper border

        // Dropdown of all script types that generates new script immediately upon click
        this.tileScriptDropdown = document.createElement('select');
        this.tileScriptsGroupContainer.appendChild(this.tileScriptDropdown);

        const headerOption = this.#createOptionInside(this.tileScriptDropdown, 'new script');
        headerOption.selected = true;
        headerOption.disabled = true;
        this.#createOptionInside(this.tileScriptDropdown, this.scriptTileType.warp);

        this.#tileControlsContainer.appendChild(this.tileScriptsGroupContainer);
    }

    #createTileSymbolDropdown() {
        this.tileSymbolDropdown = document.createElement('select');
        this.tileSymbolDropdown.id = 'tile-symbol';

        const symbols = [
            ' ',
            '.',
            ',',
            ';',
            ':',
            '!',
            '`',
            '~',
            '^',
            '*',
            '/',
            '#'
        ];
        
        for (const symbol of symbols) {
            this.#createOptionInside(this.tileSymbolDropdown, symbol);
        }
    
        this.#tileControlsContainer.appendChild(this.tileSymbolDropdown);
    }

    // TODO: Not like this
    #createTileCoordinatesText() {
        this.#tileCoordinatesTextContainer = document.createElement('div');
        this.#tileControlsContainer.appendChild(this.#tileCoordinatesTextContainer);

        this.#columnCoordinateText = document.createElement('span');
        this.#columnCoordinateText.id = 'tile-x-coordinate';
        this.#lineCoordinateText = document.createElement('span');
        this.#lineCoordinateText.id = 'tile-y-coordinate';

        this.#tileCoordinatesTextContainer.textContent = '(';
        this.#tileCoordinatesTextContainer.appendChild(this.#columnCoordinateText);
        this.#tileCoordinatesTextContainer.appendChild(document.createTextNode(','));
        this.#tileCoordinatesTextContainer.appendChild(this.#lineCoordinateText);
        this.#tileCoordinatesTextContainer.appendChild(document.createTextNode(')'));
    }

    #createTileControls() {
        // Copy/duplicate/paint mode
        this.toggleCloneModeCheckbox = this.#createCheckboxInside(this.#tileControlsContainer, 'Clone Mode', 'toggle-tile-clone');

        // Coordinates
        this.#createTileCoordinatesText();

        // TODO: Maybe dropdown with "enter new" option that transforms into textbox, like map rename is supposed to do
        this.#createTileSymbolDropdown();

        this.toggleTileIsSolidCheckbox = this.#createCheckboxInside(this.#tileControlsContainer, 'Solid', 'toggle-tile-solid');

        // Scripts e.g. warp
        this.#createTileScriptsGroupContainer();
    }

    #createTileControlsContainer() {
        this.#tileControlsContainer = document.createElement('div');

        // Only show if map editor is visible
        this.#tileControlsContainer.hide();

        // Tile controls will appear under view/map
        this.#controller.viewHtml.after(this.#tileControlsContainer);
        this.#createTileControls();
    }

    async #createMapNameControls() {
        // Create disabled dropdown showing map name
        this.mapNameDropdown = document.createElement('select');
        this.mapNameDropdown.id = 'map-name';
        this.mapNameDropdown.disabled = true;
    
        // TODO: Can't we use #createOptionInside() here?
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
        this.updateMapNameButton = this.#createButtonInside(this.#infoContainer, 'Rename/Move', 'update-map-name');
        this.updateMapNameButton.disabled = true;
        this.deleteMapButton = this.#createButtonInside(this.#infoContainer, 'Delete', 'delete-map');
        this.deleteMapButton.disabled = true;
        // TODO: Make this automatic
        this.saveMapButton = this.#createButtonInside(this.#infoContainer, 'Save', 'save-map');

        this.createMapButton = this.#createButtonInside(this.#infoContainer, 'New', 'create-map');
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
        return this.#createButtonInside(this.#infoContainer, symbol, this.#getDimensionButtonId(change, axis, side));
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
        this.mapWidthTextbox = this.#createTextboxInside(this.#infoContainer, this.#mapWidth, 'map-width');
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
        this.mapHeightTextbox = this.#createTextboxInside(this.#infoContainer, this.#mapHeight, 'map-height');
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
        this.mapDepthTextbox = this.#createTextboxInside(this.#infoContainer, this.#mapDepth, 'map-depth');
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
        this.toggleGridCheckbox = this.#createCheckboxInside(this.#mapControlsContainer, 'Grid', 'toggle-grid');
        this.toggleMaxViewCheckbox = this.#createCheckboxInside(this.#mapControlsContainer, 'Show whole map', 'toggle-max-view');
        
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
import { Coordinate } from './GameMap.js';
import Tile, { WarpTileScript } from './Tile.js';

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

    get #cloneModeIsEnabled() {
        return this.#html.toggleCloneModeCheckbox.checked;
    }

    #addClickEventListeners() {
        this.#addEventListeners([
            this.#model.viewHtml
        ], 'click');
    }

    // FIXME: Still triggers when map editor is hidden
    #didClickViewTile(tile) {
        const lineHtml = tile.parentElement;
        const layerHtml = lineHtml.parentElement;

        const column = Array.from(lineHtml.querySelectorAll('span')).indexOf(tile);
        const line = Array.from(layerHtml.querySelectorAll('pre')).indexOf(lineHtml);
        // This would presumably always result in the uppermost layer
        // const layer = Array.from(this.#model.viewHtml.children).indexOf(layerHtml);

        // TODO: Shorten logic for when using "show whole map"
        // - view coords and map coords should be identical

        // Get current (soon to previous) coord in case we're in clone mode
        // const previousTile = this.#model.getTileAtCoordinate(this.#selectedTileMapCoordinate);
        const previousCoordinate = this.#selectedTileMapCoordinate;

        this.#selectedTileMapCoordinate = this.#model.getMapCoordinateForViewCoordinate(column, line);
        this.#selectedTileMapCoordinate.layer = fakeLayer;

        // Clone into model before loading if clone mode enabled
        if (this.#cloneModeIsEnabled) {
            this.#model.replaceTile(this.#selectedTileMapCoordinate, this.#model.getTileAtCoordinate(previousCoordinate));
        }

        // Show controls for newly selected tile
        this.#html.updateTileControls(this.#model.getTileAtCoordinate(this.#selectedTileMapCoordinate), this.#selectedTileMapCoordinate);
    }

    // FIXME: Groups container remains in error state after clicking another tile
    #getValidWarpTileScript(container) {
        let column = container.querySelector('.' + this.#html.warpTileScriptColumnTextboxClass).value;
        let line = container.querySelector('.' + this.#html.warpTileScriptLineTextboxClass).value;
        // If current map is selected (blank value), let's not give a map; WarpTileScript obj doesn't need it
        const map = container.querySelector('select').value || undefined;

        // If invalid, return undefined
        if (isNaN(column) || isNaN(line)) { return; }

        // Convert string values into actual numbers
        // Must do after NaN check as parseInt will e.g. "3b" -> 3
        column = parseInt(column);
        line = parseInt(line);

        // If valid, return object
        return new WarpTileScript(
            new Coordinate(column, line),
            map
        );
    }

    #didChangeTileScriptControl() {
        // Evaluate all tile script controls
        const scriptContainers = this.#html.tileScriptsGroupContainer.querySelectorAll('.' + this.#html.tileScriptContainerClass);
        let scripts = [];
        // Visually show user when something is wrong
        const errorClass = 'error';

        // Get TileScript objects or fail validation
        for (const container of scriptContainers) {
            let script;
            if (container.classList.contains(this.#html.scriptTileType.warp)) {
                script = this.#getValidWarpTileScript(container);
            } else {
                console.warn(`Can't validate TileScript from container (classList: ${container.classList.value}).`);
            }

            // Add successful script object
            if (script) {
                scripts.push(script);
            } else {
                // Or stop as soon as we hit an error
                return this.#html.tileScriptsGroupContainer.classList.add(errorClass);
            }
        }

        // All passed, remove error CSS class if previously applied
        this.#html.tileScriptsGroupContainer.classList.remove(errorClass);

        // Remove array if empty
        if (!scripts.length) { scripts = undefined; }

        // Update model
        this.#model.updateTile(this.#selectedTileMapCoordinate, 'scripts', scripts);
    }

    #didClickRemoveTileScriptButton(button) {
        // Remove tile script container from view
        const container = button.parentElement;
        this.#html.removeTileScriptContainer(container);
        // Revalidate
        this.#didChangeTileScriptControl();
    }

    #addEventListeners(elements, eventType) {
        for (const element of elements) {
            element.addEventListener(eventType, this);
        }
    }

    async handleEvent(event) {
        // Check if user clicked a map tile
        if (event.target.tagName === 'SPAN' && event.target.closest('#' + this.#model.viewHtml.id)) {
            this.#didClickViewTile(event.target);
            return;
        }

        // Check if user chose new script from dropdown
        if (event.target === this.#html.tileScriptDropdown) {
        // Check if user chose new script from dropdown, but ignore 'input' event
        // if (event.target === this.#html.tileScriptDropdown && event.type === 'change') {
            this.#html.createTileScriptContainer();
            return;
        }

        // Check if user clicked a tile script removal button
        if (event.target.classList.contains(this.#html.removeTileScriptButtonClass)) {
            this.#didClickRemoveTileScriptButton(event.target);
            return;
        }

        // Check if user changed any other tile script controls
        // But ignore clicks and just look for inputs
        if (this.#html.tileScriptsGroupContainer?.contains(event.target)
            // && event.type === 'change') {
            && event.type === 'input') {
            this.#didChangeTileScriptControl();
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

    // NOTE: Currently just passing through to below
    async #createMap() {
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


// import MessageLog from './MessageLog.js';
import '../JSON_stringifyWithClasses.js';
// TODO: Make some shared import with this all-classes obj
const customJsonClasses = { Tile, Coordinate, WarpTileScript };

// MVC's model
class MapEditorModel {
    #game;

    #oldViewWidth;
    #oldViewHeight;
    #oldPlayerPosition;
    
    constructor(game) {
        this.#game = game;

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
        return this.#game.view.getTile(coordinate.column, coordinate.line, coordinate.layer, false);
    }

    getMapCoordinateForViewCoordinate(viewColumn, viewLine) {
        const columnOffset = viewColumn - this.#game.view.staticCenter.column;
        const lineOffset = viewLine - this.#game.view.staticCenter.line;

        const mapColumn = this.#game.view.mapCoordinateAtViewCenter.column + columnOffset;
        const mapLine = this.#game.view.mapCoordinateAtViewCenter.line + lineOffset;

        return new Coordinate(mapColumn, mapLine);
    }

    // Replace all properties of a tile
    replaceTile(coordinate, sourceTile) {
        // Clone the source tile (yes we have to do it this way)
        const json = JSON.stringifyWithClasses(sourceTile);
        // Assign clone to target tile (yes we have to do it this way)
        this.#game.view.map.lines[coordinate.layer][coordinate.line][coordinate.column] = new Tile(JSON.parseWithClasses(json, customJsonClasses));

        this.#updateView();
    }

    // Change single property of a tile
    updateTile(coordinate, property, value) {
        // const tile = this.#game.view.map.lines[coordinate.layer][coordinate.line][coordinate.column];
        const tile = this.getTileAtCoordinate(coordinate);
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
            // console.log(responseText);
            this.#game.log.print(responseText);
        } catch (err) {
            console.error(err.message);
            this.#game.log.print('Error saving map to server.');
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