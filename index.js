/**
 * Promise规范
 * 1、new Promise是需要传入一个执行器, executor, 执行器立即执行
 * 2、executor 接受2个参数 分别是resolve和reject
 * 3、Promise 的状态只能从pending到rejected或者从pending到fulfilled
 * 4、Promise 的状态一旦确认 就不会再改变
 * 5、Promise 都有then方法, then接收个， 分别是成功的回调用 onFulfilled 和失败的回调onRejected
 * 6、如果调用then时 promise已经成功, 则执行onFulfilled,并将promise的值作为参数传递进去，如果promise已经失败
 * 则执行promise 失败的回调 onRejected,如果promise的状态是pending,需要将onFulfilled和onRejected存放起来
 * 等状态确定后在执行（发布订阅模式）
 * 7、then函数onFulfilled和onRejected可以不传
 * 8、promise 可以then多次，promise 的then 方法返回一个 promise
 * 9、如果 then 返回的是一个结果，那么就会把这个结果作为参数，传递给下一个then的成功的回调(onFulfilled)
 * 10、如果 then 中抛出了异常，那么就会把这个异常作为参数，传递给下一个then的失败的回调(onRejected)
 * 11、如果 then 返回的是一个promise,那么需要等这个promise，那么会等这个promise执行完，promise如果成功，
 * 就走下一个then的成功，如果失败，就走下一个then的失败
 */

const PNEDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

function PromiseSt(executor) {
  let self = this;
  self.status = PNEDING;
  self.onFulfilled = []; // 成功回调
  self.onRejected = []; // 失败回调

  function resolve(value) {
    if (self.status === PNEDING) {
      self.status = FULFILLED;
      self.value = value;
      self.onFulfilled.forEach((fn) => fn());
    }
  }

  function reject(reason) {
    if (self.status === PNEDING) {
      self.status = REJECTED;
      self.reason = reason;
      self.onRejected.forEach((fn) => fn());
    }
  }

  try {
    executor(resolve, reject);
  } catch (error) {
    reject(error);
  }
}

PromiseSt.prototype.then = function (onFulfilled, onRejected) {
  onFulfilled =
    typeof onFulfilled === "function" ? onFulfilled : (value) => value;
  onRejected =
    typeof onRejected === "function"
      ? onRejected
      : (reason) => {
          throw reason;
        };

  let self = this;
  let promise2 = new Promise((resolve, reject) => {
    if (self.status === FULFILLED) {
      setTimeout(() => {
        try {
          let x = onFulfilled(self.value);
          resolvePromise(promise2, x, resolve, reject);
        } catch (error) {
          reject(error);
        }
      });
    } else if (self.status === REJECTED) {
      setTimeout(() => {
        try {
          let x = onRejected(self.reason);
          resolvePromise(promise2, x, resolve, reject);
        } catch (error) {
          reject(error);
        }
      });
    } else if (self.status === PNEDING) {
      self.onFulfilled.push(() => {
        setTimeout(() => {
          try {
            let x = onFulfilled(self.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(e);
          }
        });
      });
    }
  });
  return promise2;
};

function resolvePromise(promise2, x, resolve, reject) {
  let self = this;
  if (promise2 === x) {
    reject(new TypeError("Chaining cycle"));
  }
  if ((x && typeof x === "object") || typeof x === "function") {
    let used; // limit call once

    try {
      let then = x.then;
      if (typeof then === "function") {
        then.call(
          x,
          (y) => {
            if (used) return;
            used = true;
            resolvePromise(promise2, y, resolve, reject);
          },
          (r) => {
            if (used) return;
            used = true;
            reject(r);
          }
        );
      } else {
        if (used) return;
        used = true;
        resolve(x);
      }
    } catch (error) {
      if (used) return;
      used = true;
      reject(e);
    }
  } else {
    resolve(x);
  }
}


window.PromiseSt = PromiseSt
