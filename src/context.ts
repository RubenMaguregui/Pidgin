/**
 *
 * @author Rubén Maguregui
 */
export interface Context {

  get(name:string): any;

  set(name:string, value:any): void;

}

export class ObjectContext implements Context{

  context:Object;

  constructor(context:Object) {
    this.context = context;
  }

  get(name:string):any {
    return this.context[name];
  }

  set(name:string, value:any):void {
    this.context[name] = value;
  }
}