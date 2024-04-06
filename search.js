function replaceFrom(fullString, searchValue, replaceValue, fromIndex) {
    beforeString = fullString.substring(0, fromIndex);
    afterString = fullString.substring(fromIndex + searchValue.length)
    return [beforeString + replaceValue, afterString];
}

function search() {
    let request = document.querySelector('.search-field input').value;
    const inputedValue = request;
    const matchCase = document.querySelector('#match-case').checked;
    const wholeWord = document.querySelector('#whole-word').checked;
    let regexFlags = "g";
    if (matchCase) regexFlags += "i";
    document.body.innerHTML = defaultDocument;
    if (request) {
        const tag = "(<([^>]+)>)*";
        let regex = "";
        lastSymbol = request.slice(-1);
        request = request.substring(0, request.length - 1);
        for (const char of request) {
            regex += char + tag;
        }
        regex += lastSymbol;

        if (wholeWord) regex = "(?<![_0-9a-zA-Zа-яёА-ЯЁ])" + regex + "(?![_0-9a-zA-Zа-яёА-ЯЁ])";
        let pattern = new RegExp(regex, regexFlags);
        let html = document.body.innerHTML;
        let match = pattern.exec(html);
        let newHtml = "";
        if (match) {
            newHtml = html.substring(0, match.index);
            html = html.substring(match.index);
        }

        let replacedHtml = "";
        let resCount = 0;
        const classTagHighlight = "class = 'search-highlight-tag'";
        while (match) {
            pattern = new RegExp(regex, regexFlags);

            startTag = newHtml.lastIndexOf("<");
            endTag = newHtml.lastIndexOf(">");
            if (startTag > endTag) {
                [beforeString, html] = replaceFrom(html, match[0], match[0], 0);
                newHtml += beforeString;
                match = pattern.exec(html);
                if (match) {
                    newHtml += html.substring(0, match.index);
                    html = html.substring(match.index);
                }
                continue;
            }

            const tagRe = new RegExp("(<([^>]+)>)", regexFlags);
            let tagMatch = tagRe.exec(match[0]);
            let matchWithTag = match[0];
            let newMatch = "";
            let replacedMatch = "";
            let tagCount = 0;
            while (tagMatch) {
                const tagRe = new RegExp("(<([^>]+)>)", regexFlags);
                const idTagHighlight = `id = 'search-tag-${resCount}-${tagCount}'`
                const tagHighlight = `</span>${tagMatch[0]}<span ${idTagHighlight} ${classTagHighlight}>`;
                [replacedMatch, matchWithTag] = replaceFrom(matchWithTag, tagMatch[0], tagHighlight, tagMatch.index);
                newMatch += replacedMatch;
                tagMatch = tagRe.exec(matchWithTag);
                tagCount++;
            }
            newMatch += matchWithTag;

            const htmlHighlight = `<span id = 'search-${resCount}' class = 'search-highlight'>${newMatch}</span>`;
            [replacedHtml, html] = replaceFrom(html, match[0], htmlHighlight, 0);
            newHtml += replacedHtml;
            resCount++;
            match = pattern.exec(html);
            if (match) {
                newHtml += html.substring(0, match.index);
                html = html.substring(match.index);
            }
        }
        newHtml += html;

        console.log("Count: " + resCount);
        document.body.innerHTML = newHtml;

        highlightSelected(false);

        document.querySelector('.search-highlight-selected').scrollIntoView(false);
    }
    drawSearchPanel();
    document.querySelector('#match-case').checked = matchCase;
    document.querySelector('#whole-word').checked = wholeWord;
    inputField = document.querySelector('.search-field input');
    inputField.value = inputedValue;
    inputField.focus();
}

function isHidden(element){
    return !element.checkVisibility() || !(element.getBoundingClientRect().x >= 0);
}

function highlightSelected(isHighlighted, currentElement = null)
{
    let currentHighlight = isHighlighted ? "-selected" : "";
    let highlight = isHighlighted ? "" : "-selected";
    let searchHiglight = currentElement ?? document.querySelector('.search-highlight' + currentHighlight);
    searchHiglight.className = "search-highlight" + highlight;
    const allTags = document.querySelectorAll(`span[id^='search-tag-${searchHiglight.id.split('-')[1]}']`);
    allTags.forEach(tag => {
        tag.className = "search-highlight-tag" + highlight;
    });
}

function searchDown(reverse = false)
{
    if (document.querySelector("span[class^='search-highlight']")){
        highlightSelected(true);
        const allSearch = document.querySelectorAll('.search-highlight');
        let currentIndex = searchIndex;
        while(true){
            if(reverse){
                searchIndex = searchIndex - 1 >= 0 ? --searchIndex : allSearch.length - 1;
            }
            else{
                searchIndex = searchIndex + 1 < allSearch.length ? ++searchIndex : 0;
            }
            if (!isHidden(allSearch[searchIndex])) break;
            if (currentIndex == searchIndex){
                searchIndex = currentIndex;
                break;
            }
        }
        highlightSelected(false, allSearch[searchIndex]);
        document.querySelector('.search-highlight-selected').scrollIntoView(false);
    }
}

function drawSearchPanel() {
    styleValue = `#search-panel {    
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        position: fixed;
        background-color: white;
        top: 0;
        right: 10%;
        width: 520px;
        height: 45px;
    }
    #search-panel .search-field {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        height: 60%;
    }
    #search-panel input {
        height: 100%;
    }
    #search-panel button {
        margin-left: 5px;
        height: 100%;
    }
    #search-panel label {
        display: contents;
    }
    #search-panel label input {
        margin-left: 10px;
        margin-right: 5px;
        height: 100%;
    }
    .search-highlight, .search-highlight-tag{
        background-color: yellow;
    }
    .search-highlight-selected, .search-highlight-tag-selected{
        background-color: orange;
    }`;

    panelHtml = `<div class="search-field">
                    <input name="request" type="text">
                    <button class="send">&#x1F50E;&#xFE0E;</button>
                    <button class="arrow-up">&#8593;</button>
                    <button class="arrow-down">&#8595;</button>
                    <label>
                        <input type="checkbox" id="match-case" checked />
                        match case
                    </label>
                    <label>
                        <input type="checkbox" id="whole-word" />
                        whole word
                    </label>
                    <button class="close">&#10005;</button>
                </form>`;

    const style = document.createElement("style");
    style.innerHTML = styleValue;
    document.body.appendChild(style);

    const panel = document.createElement("div");
    panel.id = "search-panel";
    panel.innerHTML = panelHtml;
    document.body.appendChild(panel);

    document.querySelector('.search-field input').focus();
    const isSearch = !document.querySelector("span[class^='search-highlight']");
    document.querySelector('.search-field .arrow-down').disabled = isSearch;
    document.querySelector('.search-field .arrow-up').disabled = isSearch;
    searchIndex = 0;
    addSearchListeners();
}

function addSearchListeners() {
    const sendButton = document.querySelector('.search-field .send');
    sendButton.addEventListener("click", search);
    const searchField = document.querySelector('.search-field input');
    searchField.addEventListener("keypress", e => { if (e.key === 'Enter') search(); });
    const closeButton = document.querySelector('.search-field .close');
    closeButton.addEventListener("click", e => { document.body.innerHTML = defaultDocument; });
    const arrowDownButton = document.querySelector('.search-field .arrow-down');
    arrowDownButton.addEventListener("click", () => {searchDown(false);});
    const arrowUpButton = document.querySelector('.search-field .arrow-up');
    arrowUpButton.addEventListener("click", () => {searchDown(true);});
}

window.addEventListener("keydown", e => {
    if (e.ctrlKey && e.code === 'KeyF') {
        if (document.querySelector('#search-panel'))
            document.body.innerHTML = defaultDocument;
        else
            drawSearchPanel();
        e.preventDefault();
    }
});

var defaultDocument = document.body.innerHTML;
var searchIndex = 0;