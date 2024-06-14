## Features

Let you able to close an image view by clicking it, and use your mouse wheel or mouse drag to switch between the previous image or the next one.

### About drag to switch images

You can enable it in script menu.

Due to some complex reasons, drag to switch images only support for webkit-based browser.

## About "Set aria-label"

v1.0.0 is an major update, usually you will no longer need to set up aria-label and it support all languages.

But if you are using **Firefox**, you still need to manually set aria-label for special reasons.

Press F12 to open the DevTools, and follow the steps below to get the aria-label values ​​of the **Close, Previous, Next** buttons.

![](https://i.loli.net/2020/03/04/8zUhaoJbvuGSZm2.png)

Then click "Set aria-label" from the script menu, concatenate the three aria-label values with commas(,), fill them into the input box and submit.

If you need to disable the aria-label setting, leave the input box empty and submit directly.
