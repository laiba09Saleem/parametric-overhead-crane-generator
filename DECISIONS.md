# DECISIONS.md

## 1. Who is the user, and what do they need?

The primary users are the engineering team because they need to enter basic crane parameters such as span, capacity, girder height, end truck length, and lift height. The application automatically generates a 2D drawing based on these parameters.

They need to view the front and top views of the crane with geometric dimensions. They can also create different crane designs, save them in the database, and reopen and edit them later.

The main purpose is to reduce manual drawing preparation time and make the initial design visualization easier.

## 2. What did you assume (crane type, inputs, units, ranges), and why?

I assumed a top-running single-girder crane with an under-running trolley hoist. According to the assignment, I had to select one specific crane configuration. I selected a single-girder configuration to keep the project scope manageable. I implemented a 2D drawing generator for this configuration using parameter inputs.

The parameters used in the project are:

- Design name: 1–100 characters
- Span: 3–30 metres
- Capacity: 0.5–20 tonnes
- Girder height: 0.2–2.0 metres
- End truck length: 0.5–3.0 metres
- Lift height: 1–15 metres

These ranges were selected for software input validation and drawing generation. The purpose was to test different crane configurations and make sure the drawings fit within the canvas.

These ranges are not manufacturer specifications or engineering safety limits. I have not claimed that they are based on any verified engineering standard.

There are also some important assumptions. Capacity is displayed on the drawing for information only and is not used for structural calculations. Lift height is also an informational label and does not calculate the actual hook position.

Some component dimensions, such as trolley width, end truck width, and girder plan width, use fixed illustrative values because verified manufacturer dimensions were not available.

## 3. Where did each formula or rule come from, and how sure are you?

I used the following rules for crane component positioning and geometry:

- Span is the distance between the centre lines of the runway rails.
- Girder height is the distance between the top and bottom of the main girder.
- End truck length is shown along the runway direction in the Top View.
- End trucks are positioned at the runway rail centre lines.
- The main girder is placed between the inner faces of the end trucks.
- The trolley is placed in the centre of the girder.
- The hoist is positioned below the trolley.

These rules were used to define the crane geometry.

**Drawing scale formula:**

I used the same drawing scale for the Front View and Top View. First, I calculated the available width and height of the SVG canvas. Then I calculated the scale required to fit the crane dimensions within the available space. From both views, the smallest calculated scale was selected as the common scale.

The purpose was to make sure both views fit within the drawing canvas and maintain a consistent scale.

**Illustrative dimensions:**

I assumed some fixed illustrative dimensions, such as end truck width, girder plan width, trolley width and height, hoist width and height, and rope length. These values were not taken from a verified manufacturer catalogue or engineering standard.

**Confidence level:**

I have high confidence in the mathematical calculations and drawing scale fitting logic because I verified the calculations through test cases. Input validation and drawing positioning were also tested.

However, I have limited confidence in the actual engineering accuracy of the component dimensions because they were not validated using crane engineer feedback or manufacturer data.

That is why the generated drawing is intended for initial visualization, not as a certified engineering design.

## 4. What did you leave out on purpose?

I did not include structural engineering calculations such as bending stress, shear force, deflection, buckling, and fatigue analysis.

**Load capacity verification:**

The capacity input is only displayed on the drawing for information. I did not verify whether the crane can safely lift the entered load.

**Detailed component selection:**

I did not include features such as hoist and motor selection, detailed trolley and end truck sizing, or manufacturer-specific component dimensions.

**Safety and standards:**

I did not calculate safety factors, verify engineering standards compliance, or include safety certification.

**Additional features:**

I also left out 3D CAD modelling, multiple crane configurations, End View, and PDF/DXF drawing export. These features are not included in the current implementation.

**Why did I leave these features out?**

The assignment scope was limited, and verified manufacturer data or engineering reference information was not available. The main focus of the project was parametric 2D drawing generation, basic geometry, and design management.

Without proper engineering validation, including structural calculations or making safety claims could be misleading.

## 5. What three questions would you ask our engineers?

**1. Engineering dimensions and references**

For actual dimension and geometry verification of crane components, which manufacturer drawings, catalogues, or engineering standards should we use?

The reason for asking this question is that I used some illustrative values for component dimensions. It is important to verify them using actual engineering references.

**2. Engineering calculations and safety**

For real crane designs, which structural calculations, load conditions, and safety factors are required?

The reason for asking this question is that our current application does not perform structural calculations or load capacity verification.

**3. Real engineering workflow and feature requirements**

In real engineering projects, which additional features, crane configurations, views, and export formats do engineers need in a crane drawing generator?

The reason for asking this question is that I have currently implemented Front View and Top View. Additional views and PDF/DXF export could be considered for future improvements.

## 6. What would you do with another week?

If I had another week, I would focus on the following improvements:

**1. Validate engineering assumptions**

First, I would verify the illustrative component dimensions with crane engineers and manufacturer catalogues. I would also check the crane geometry and component positioning against engineering references.

The reason is that some dimensions are currently assumed values, not verified manufacturer specifications.

**2. Improve testing**

I would add more test cases for backend geometry calculations. I would also test minimum and maximum input values and boundary cases, and improve API and frontend integration testing.

The reason is to improve the application's reliability with different crane parameters.

**3. Add missing drawing features**

If engineers need them, I would add the End View and implement PDF/DXF export functionality.

This would allow engineers to save and share the generated drawings.

**4. Improve engineering functionality**

I would discuss the required structural calculations and load conditions with engineers. After getting proper engineering references and validation, I would implement the relevant calculations.

The reason is that understanding engineering requirements is important to improve the application beyond basic visualization.
