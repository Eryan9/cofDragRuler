Hooks.once("setup", async function() {

    game.cofDragRuler = Macros;

	game.settings.register("cofDragRuler", "globalDistances", {
        name: "Configuration unique",
        hint: "Applique les mêmes distances (ci-dessous) à tous le monde",
		scope: "world",
        type: Boolean,      
		default: true,
        config: true,
    });

    game.settings.register("cofDragRuler", "walkDistance", {
        name: "Distance de marche",
        scope: "world",
        type: Number,
        default: 10,
        config: true
    });

    game.settings.register("cofDragRuler", "runDistance", {
        name: "Distance de course",
        scope: "world",
        type: Number,
        default: 20,
        config: true
    });	
});

Hooks.once("dragRuler.ready", async function(SpeedProvider) {
    class cofSpeedProvider extends SpeedProvider {
        get colors() {
            return [
                {id: "walk", default: 0x00FF00, name: "Distance de marche"},
                {id: "run", default: 0xFF8000, name: "Distance de course"}
            ]
        }

        getRanges(token) {
            const global = game.settings.get("cofDragRuler","globalDistances");
            const settingWalkDistance = game.settings.get("cofDragRuler","walkDistance");
            const settingRunDistance = game.settings.get("cofDragRuler","runDistance");

            const walkDistance = global ? settingWalkDistance : token.actor.data.data.moduleData?.cofDragRuler?.distances?.walk;
            const runDistance = global ? settingRunDistance : token.actor.data.data.moduleData?.cofDragRuler?.distances?.run;

			const ranges = [
				{range: walkDistance, color: "walk"},
                {range: runDistance, color: "run"}
			]

            return ranges
        }
    }

    dragRuler.registerModule("cofDragRuler", cofSpeedProvider)
})

export class Macros{
    static getDistances(){
        if (TokenLayer.instance.controlled.length > 1) ui.notifications.warn("Veuillez ne sélectionner qu'un seul token");
        else if (TokenLayer.instance.controlled.length <= 0) ui.notifications.warn("Veuillez sélectionner un token");
        else {
            let tokens = TokenLayer.instance.controlled;

            tokens.forEach((token)=>{
                let walkDistance = token.actor.data.data.moduleData?.cofDragRuler?.distances?.walk;
                let runDistance = token.actor.data.data.moduleData?.cofDragRuler?.distances?.run;
                
                if (!walkDistance || !runDistance){
                    ui.notifications.warn(`Les distances ne sont pas configurées pour '${token.name}'`);
                }
                else
                {
                    ui.notifications.notify(`Les distances Drag Ruler pour '${token.name}' : marche (${walkDistance ?? 0}) - course (${runDistance ?? 0})`);
                }
            });
        }
    }

    static setDistances(){
        if (TokenLayer.instance.controlled.length > 0)
        {
            let content = `
                <div class="flexrow" style="margin: 10px; align-items: center">
                    <label for="walkDistance" style="flex-basis: 130px; flex-grow:unset">Distance de marche :</label>
                    <input id="walkDistance" class="flex1" type="number" value="0" data-dtype="Number" style="margin-left:10px; flex-basis: 50px; flex-grow: unset;"/>
                </div>
            
                <div class="flexrow" style="margin: 10px; align-items: center">
                    <label for="runDistance" style="flex-basis: 130px; flex-grow:unset">Distance de course :</label>
                    <input id="runDistance" class="flex1" type="number" value="0" data-dtype="Number" style="margin-left:10px; flex-basis: 50px; flex-grow: unset;"/>
                </div>`;
        
            let d = new Dialog({
                title: "Configuration des distances - Drag Ruler",
                content: content,
                buttons: {
                    save: {
                        icon: '<i class="fas fa-check"></i>',
                        label: "Sauvegarder",
                        callback: (html)=>{
                            let walkDistance = parseFloat(html.find("#walkDistance").val());
                            walkDistance = isNaN(walkDistance) ? 0 : walkDistance;
                            
                            let runDistance = parseFloat(html.find("#runDistance").val());
                            runDistance = isNaN(runDistance) ? 0 : runDistance;
                            
                            let tokens = TokenLayer.instance.controlled;

                            tokens.forEach((token)=>{
                                token.actor.update({
                                                    data:{
                                                        moduleData:{
                                                            cofDragRuler:{
                                                                distances:{
                                                                    walk:walkDistance,
                                                                    run:runDistance
                                                                }
                                                            }
                                                        }
                                                    }
                                                });
                            });
                            
                            ui.notifications.notify(`Les distances des tokens sélectionnés ont été réglées à : marche (${walkDistance ?? 0}) - course (${runDistance ?? 0})`);
                        }
                    },
                    cancel: {
                        icon: '<i class="fas fa-times"></i>',
                        label: "Annuler",
                    }
                },
                default: "save"
            });
            d.render(true);
        }
        else
        {
            ui.notifications.warn("Veuillez sélectionner au moins 1 token");
        }
    }
}