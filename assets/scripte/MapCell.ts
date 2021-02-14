export enum ECellType {
    NOMAL,
    START,
    END,
    PATH,
    OBSTACLES,
}

const {ccclass, property, executeInEditMode} = cc._decorator;

@ccclass
@executeInEditMode
export default class MapCell extends cc.Component {
    @property(cc.Label)
    private eName: cc.Label = null;

    @property()
    private _type = 0;

    @property()
    get eType() {
        return this._type;
    }
    set eType(type) {
        this._type = type;
        this.setType(type);
    }

    init(x: number, y: number) {
        this.eName.string = `${x}_${y}`;
    }
    
    setType(type: number) {
        let color: cc.Color = cc.color(113, 190, 113);
        switch(type) {
            case ECellType.START: {
                color = cc.color(125, 125, 226);
                break;
            }
            case ECellType.END: {
                color = cc.color(226, 125, 125);
                break;
            }
            case ECellType.PATH: {
                color = cc.color(125, 226, 125);
                break;
            }
            case ECellType.OBSTACLES: {
                color = cc.color(125, 125, 125);
                break;
            }
        }
        this.node.color = color;

    }
}
