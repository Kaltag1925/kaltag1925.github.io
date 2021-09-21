# This is probably like my 15th fork or something of whatever this was original 🤷‍♂️

https://observablehq.com/@kaltag1925/this-is-probably-like-my-15th-fork-or-something-of-whatever-t@791

View this notebook in your browser by running a web server in this folder. For
example:

~~~sh
npx http-server
~~~

Or, use the [Observable Runtime](https://github.com/observablehq/runtime) to
import this module directly into your application. To npm install:

~~~sh
npm install @observablehq/runtime@4
npm install https://api.observablehq.com/d/e98cf432753a4295@791.tgz?v=3
~~~

Then, import your notebook and the runtime as:

~~~js
import {Runtime, Inspector} from "@observablehq/runtime";
import define from "@kaltag1925/this-is-probably-like-my-15th-fork-or-something-of-whatever-t";
~~~

To log the value of the cell named “foo”:

~~~js
const runtime = new Runtime();
const main = runtime.module(define);
main.value("foo").then(value => console.log(value));
~~~
